import dns from "node:dns/promises";
const SUPPORTED = ["A","AAAA","MX","NS","TXT","CNAME"];
const validDomain = (d) => typeof d === "string" && d.length <= 253 &&
  d.split(".").length >= 2 && d.split(".").every(x => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(x));

function fsm(initial="IDLE") {
  const history=[{state:initial,reason:"Waiting for a DNS query",at:new Date().toISOString()}];
  const move=(state,reason)=>history.push({state,reason,at:new Date().toISOString()});
  return {history,move};
}
export async function processDnsQuery(domain, recordType) {
  const machine=fsm(); machine.move("QUERY_RECEIVED","Request received by API");
  machine.move("INPUT_VALIDATION","Checking domain syntax and record type");
  if (!validDomain(domain)) {
    machine.move("INVALID_RESPONSE","Domain name failed input validation");
    machine.move("COMPLETED","Request completed without DNS lookup");
    return result(domain,recordType,null,[rule("Domain syntax","Invalid","Valid DNS hostname","FAIL","Enter a valid fully qualified domain name.")],"INVALID_INPUT","The supplied domain name is not valid.", "Correct the domain name and try again.",machine);
  }
  if (!SUPPORTED.includes(recordType)) {
    machine.move("INVALID_RESPONSE","Record type is not supported");
    machine.move("COMPLETED","Request completed without DNS lookup");
    return result(domain,recordType,null,[rule("Supported record type",recordType,SUPPORTED.join(", "),"FAIL","Choose one of the supported record types.")],"UNSUPPORTED_TYPE","The requested DNS record type is not supported by this application.","Select A, AAAA, MX, NS, TXT, or CNAME.",machine);
  }
  machine.move("DNS_RESOLUTION",`Resolving ${recordType} records for ${domain}`);
  let answers=null, responseCode="NOERROR", error=null;
  try {
    const fn={A:"resolve4",AAAA:"resolve6",MX:"resolveMx",NS:"resolveNs",TXT:"resolveTxt",CNAME:"resolveCname"}[recordType];
    answers=await dns[fn](domain);
  } catch(e) {
    error=e;
    if (e.code==="ENODATA") responseCode="NOERROR";
    else if (e.code==="ENOTFOUND") responseCode="ENOTFOUND";
    else if (e.code==="ETIMEOUT" || e.code==="ESERVFAIL") responseCode=e.code;
    else responseCode=e.code || "DNS_ERROR";
  }
  machine.move("RESPONSE_RECEIVED", error ? `Resolver returned ${responseCode}` : `${answers.length} answer record(s) received`);
  machine.move("RESPONSE_VALIDATION","Applying response and record-type validation rules");
  const rules=[];
  rules.push(rule("Query input",domain,"Valid hostname","PASS","The domain passed basic hostname syntax validation."));
  rules.push(rule("Requested record type",recordType,SUPPORTED.join(", "),"PASS","The record type is supported."));
  if (!error) {
    rules.push(rule("Resolver execution","Success","Resolver completes without error","PASS","The DNS resolver returned a response."));
    rules.push(rule("Answer payload",answers.length, "One or more records, or a legitimate no-data result","PASS","The resolver returned a well-formed answer array."));
    machine.move("VALID_RESPONSE",answers.length ? "A DNS answer was returned and passed structural checks" : "No records of this type; resolver reported NOERROR/NODATA");
  } else if (eIsNoData(error)) {
    rules.push(rule("DNS answer",0,"A record may or may not exist for this type","PASS","The domain resolved, but it has no record of the requested type (NODATA). This is not automatically an invalid domain."));
    machine.move("VALID_RESPONSE","NODATA is a legitimate DNS outcome for this query");
  } else {
    const category = responseCode==="ENOTFOUND" ? "NXDOMAIN" : responseCode==="ETIMEOUT" ? "TIMEOUT" : "DNS_RESOLUTION_FAILURE";
    rules.push(rule("DNS resolver status",responseCode,"Successful resolution or a recognized DNS outcome","FAIL",`The resolver could not complete the requested lookup (${responseCode}).`));
    machine.move(category==="TIMEOUT"?"TIMEOUT":"DNS_ERROR",`DNS lookup failed: ${responseCode}`);
  }
  machine.move("COMPLETED","Validation and diagnostics finished");
  const outcome=error && !eIsNoData(error) ? "DNS_ERROR" : "VALID";
  const category=error ? (responseCode==="ENOTFOUND"?"NXDOMAIN":responseCode==="ETIMEOUT"?"TIMEOUT":eIsNoData(error)?"NODATA":"DNS_RESOLUTION_FAILURE") : answers.length ? "ANSWER_FOUND" : "NODATA";
  const explanation=category==="NODATA" ? `The domain exists/resolved, but no ${recordType} record was returned.` :
    category==="NXDOMAIN" ? "The DNS resolver reports that the domain name does not exist." :
    category==="TIMEOUT" ? "The DNS lookup timed out before a response was received." :
    error ? `DNS resolution failed with ${responseCode}.` : `${answers.length} ${recordType} record(s) were returned and passed the implemented checks.`;
  const recommendation=category==="NODATA" ? `Check whether ${domain} is expected to publish a ${recordType} record; no record of this type is not necessarily an error.` :
    category==="NXDOMAIN" ? "Check the spelling and registration of the domain." :
    category==="TIMEOUT" ? "Retry the query and check network connectivity or DNS resolver availability." :
    error ? "Retry later and verify the network and DNS resolver configuration." : "No corrective action is required for this response.";
  return {domain,recordType,response:{status:responseCode,answers:answers ?? [],error:error?{code:error.code,message:error.message}:null,source:"live Node.js DNS resolver"},
    validation:{status:outcome,category,rules},diagnostic:{explanation,recommendation,failedRules:rules.filter(r=>r.status==="FAIL").map(r=>r.name)},
    fsm:{currentState:"COMPLETED",history:machine.history},createdAt:new Date()};
}
function eIsNoData(e){return e?.code==="ENODATA";}
function rule(name,observed,expected,status,explanation){return {name,observed,expected,status,explanation};}
function result(domain,recordType,response,rules,category,explanation,recommendation,machine){return {domain,recordType,response,validation:{status:"INVALID",category,rules},diagnostic:{explanation,recommendation,failedRules:rules.filter(x=>x.status==="FAIL").map(x=>x.name)},fsm:{currentState:"COMPLETED",history:machine.history},createdAt:new Date()};}

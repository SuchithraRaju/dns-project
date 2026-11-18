import {Router} from "express";
import {processDnsQuery} from "../services/dnsService.js";
import {saveHistory} from "../services/historyService.js";
const router=Router();
router.post("/query",async(req,res)=>{
  try {
    const domain=String(req.body?.domain ?? "").trim().toLowerCase();
    const recordType=String(req.body?.recordType ?? "").trim().toUpperCase();
    const result=await processDnsQuery(domain,recordType);
    await saveHistory(result);
    res.json({success:true,data:result});
  } catch(e) { res.status(500).json({success:false,message:"Failed to process DNS query",detail:e.message}); }
});
export default router;

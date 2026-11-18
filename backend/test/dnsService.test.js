import test from "node:test";
import assert from "node:assert/strict";
import {processDnsQuery} from "../src/services/dnsService.js";
test("rejects malformed domain",async()=>{const r=await processDnsQuery("bad domain","A");assert.equal(r.validation.category,"INVALID_INPUT");});
test("rejects unsupported type",async()=>{const r=await processDnsQuery("example.com","PTR");assert.equal(r.validation.category,"UNSUPPORTED_TYPE");});
test("records actual FSM completion",async()=>{const r=await processDnsQuery("example.com","A");assert.equal(r.fsm.currentState,"COMPLETED");assert.ok(r.fsm.history.some(x=>x.state==="DNS_RESOLUTION"));});

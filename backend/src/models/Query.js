import mongoose from "mongoose";
const querySchema = new mongoose.Schema({
  domain: {type:String,required:true}, recordType:{type:String,required:true},
  response:{type:mongoose.Schema.Types.Mixed}, validation:{type:mongoose.Schema.Types.Mixed,required:true},
  diagnostic:{type:mongoose.Schema.Types.Mixed,required:true}, fsm:{type:mongoose.Schema.Types.Mixed,required:true},
  createdAt:{type:Date,default:Date.now}
});
export default mongoose.models.DnsQuery || mongoose.model("DnsQuery",querySchema);

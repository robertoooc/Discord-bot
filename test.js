import { dbConnect } from "./src/models/index.js";
import User from "./src/models/User.js";


async function test(){
    await dbConnect()
  try{
 
 }catch(err){
     console.log(err)
 }
}
test()
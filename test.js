import { dbConnect } from "./src/models/index.js";
import User from "./src/models/User.js";
dbConnect()


 async function test(){
  try{
    const test = await User.create({
      username:'ji4',
      discordId:'14',
      jobs:[
        {
          name:'test',
          status:'rejected'
        }
      ]
    })
    console.log(test)
 }catch(err){
     console.log(err)
 }
}
test()
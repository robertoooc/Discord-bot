import { dbConnect } from "./src/models/index.js";
import User from "./src/models/User.js";


async function test(){
    await dbConnect()
  try{
    await User.deleteMany({})
//  const findUser = await User.findOne({username:''})
//  const jobs = findUser.jobs.map((job) => {
//     return {
//       label: job.name,
//       value: job.id,
//     };
//   })
//  console.log(findUser)  
//  console.log(jobs)
 }catch(err){
     console.log(err)
 }
}
test()
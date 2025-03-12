import { Client , Storage, ID } from "node-appwrite"
import { InputFile } from "node-appwrite/file"

  const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66ae8131002f21a43057')
  .setKey('standard_02648e9209f38d7a2f720a3fbc7a9e393588ce9150e22f10132ea59d6e46d25893f51a370f11b3341317a1a849e5ba7d152a3b8400d74046077cb43d33584f127dd4b7a4438d900060dc4b3a305c6af59b9a8c79b8612c014235d81dccb076e9eedd431819e0003a0b4cb4dfd4d957c1bc7c7ba71a79587368382027de17c95b');

const storage = new Storage(client);


const nodeFile = InputFile.fromPath(thumbnail, req.files?.thumbnail[0].filename);
const nodeFile1 = InputFile.fromPath(video, req.files?.video[0].filename);
const respons = await storage.createFile('66ae83e30000e73fbc00', ID.unique(), nodeFile);
const respon = await storage.createFile('66ae83e30000e73fbc00', ID.unique(), nodeFile1);

console.log(respons)
console.log(respon)
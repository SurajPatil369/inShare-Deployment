const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const File = require("../models/file");

const { v4: uuid4 } = require("uuid");



//to handle file configuration
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage,
  limit: { fileSize: 100000 * 100 }, //max file size allowed is 100 mb
}).single("myfile"); //only one file is allowed at a time .(this file name is should be same as the request ur going to get from api)

router.post("/", (req, res) => {
  //store file into upload folder
  upload(req, res, async (error) => {
    //validate req
    if (!req.file) {
      return res.json({ error: "all fields are required" });
    }
    if (error) {
      return res.status(500).send({
        error: error.message,
      });
    }
    //store into database
    const file = new File({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });
    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
    //http://localhost:3000/files/313545sdskjdnks25sdlfjbjbjb
  });


});

router.post('/send',async(req,res)=>{
 
  console.log(req.body);
  const {uuid,emailTo,emailFrom}=req.body;//object destructring
 //validate request
  if (!uuid || !emailTo || !emailFrom){
    return res.status(422).send({error:'all fields are required.'});
  }
   //Get data from database
   const file= await File.findOne({uuid:uuid});
   if (file.sender){// for sending request only once 
    return res.status(422).send({error:'email already sent'}); 
   }

   file.sender=emailFrom;
   file.receiver=emailTo;
   const response=await file.save()

   //send email
    const sendMail=require('..//services/emailService');
    sendMail({
      from:emailFrom,
      to: emailTo,
      subject:'inShare file sharing',
      text:`${emailFrom} shared file with you`,
      html: require('../services/emailTemplate')({
        emailFrom: emailFrom,
        downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
        size: parseInt(file.size/100)+' KB',
        expires: '24 hours'
      })
    });
    return res.send({sucess:true});
})

module.exports = router;

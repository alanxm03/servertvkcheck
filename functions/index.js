const express = require('express');
const app=express();
const serverless=require('serverless-http');  //serverless-http
const mongoose =require('mongoose')
require("dotenv").config();   //.env
var cors = require('cors')    //cors
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path =require('path')
app.use(cors({
    origin: 'https://tvk-pipeline.netlify.app'
  }));
app.use(express.json());
console.log("hi");
const router = express.Router();
app.use(express.urlencoded({ extended: true }));




const uri = 'mongodb+srv://TVKADMIN:adminTVK@cluster0.n9ztzxt.mongodb.net/TVK?retryWrites=true&w=majority';


// MongoDB options (optional)
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
// mongoose.connect(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then( ()=> {
//     console.log("Connected to Atlas!");
// }).catch((e) =>{
//     console.log("Error",e)
// });


var member=new mongoose.Schema({

    memberId:{
        type:String,
        required:true
    },

    name:{
        type:String,
        required:true
        
    },
    fatherName:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true
    },
    whatsapp:{
        type:Number,
        required:true
    },
    email:{
        type:String
    },
    state:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    area:{
        type:String,
        required:true
    },
    position:{
        type:String,
        required:true
    },
    positionDesc:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    }
});

const memberModel=mongoose.model('TVKMEMBERS',member)


router.post('/registermember',async(req,res)=>{

    try {
        // Connect to the MongoDB database using Mongoose
        await mongoose.connect(uri, options);
        const lastMember=await member.findOne({}, {}, { sort: { memberId: -1 } });
        let newId;

        if (lastMember) {
          const lastId = parseInt(lastMember.memberId.slice(2)); // Remove the prefix and parse to int
          newId = '14' + (lastId + 1).toString().padStart(5, '0'); // Increment and format
        } else {
          newId = '1400000'; // Initial ID
        }
        let data={
            "memberId":newId,
            "name":req.body.name,
            "fatherName":req.body.fatherName,
            "gender":req.body.gender,
            "dob":req.body.dob,
            "country":req.body.country,
            "contact":req.body.contact,
            "whatsapp":req.body.whatsapp,
            "email":req.body.email,
            "state":req.body.state,
            "district":req.body.district,
            "area":req.body.area,
            "position":req.body.position,
            "positionDesc":req.body.positionDesc,
            "address":req.body.address,
        }
        const ifExist = await memberModel.findOne({contact:data.contact});
        if(!ifExist){
            let saveMember=await memberModel.create(data)
            // res.status(200).json(saveMember)
            res.status(200).json({data:"Saved to DataBase",memberId:saveMember.memberId})
            

            
        }else{
            res.status(500).json({message: 'Data Exisits'})
        }
        // Perform a MongoDB find operation
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);dist
        res.status(500).json({ error: "Internal Server Error" });
      }


    // console.log(data);
})


router.post('/dowloadcertificate/:memberId',async(req,res)=>{
    try{
        await mongoose.connect(uri, options);
        let memberId = req.params.memberId;
        const member = await memberModel.findById(memberId);
        if (!member) {
            return res.status(404).send('Member not found');
          }else{
            const dob = user.dob;
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
            age--; // Adjust age if the user's birthday hasn't occurred yet this year
            }
            const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = currentDate.getFullYear();

            const formattedDate = `${day}-${month}-${year}`;

            // Load the membership card template image
            const imageUrl = 'https://res.cloudinary.com/deobqjvg1/image/upload/v1691476376/CardCertificate_pnnnkp.jpg';
            const cardTemplate = await loadImage(imageUrl);

            // Create a new canvas
            const canvas = createCanvas(cardTemplate.width, cardTemplate.height);
            const ctx = canvas.getContext("2d");

            // Draw the membership card template image on the canvas
            ctx.drawImage(cardTemplate, 0, 0, cardTemplate.width, cardTemplate.height);

            // Set font and color for the user details
            ctx.font = " 70px 'Noto Sans Tamil'";
            ctx.fillStyle = "#000000";
        

            // Draw user details on the canvas
            //id
            ctx.fillText(age, 4590, 1350);
            //memberID
            ctx.fillText("1410012", 3450, 1242);

            //name
            ctx.fillText(member.name, 3450, 1350);
            //fatherName
            ctx.fillText(member.fatherName, 3700, 1468);
            //area
            ctx.fillText(member.area, 3700, 1805);
            //district
            ctx.fillText(member.district, 3500, 1910);

            //current date
            ctx.fillText(formattedDate,3200,2028)

            ctx.font = " 50px 'Noto Sans Tamil'";
            //state
            ctx.fillText(member.state, 4445, 1690);

            // Save the final image with user details
            const outputPath = path.join(process.env.USERPROFILE, 'Downloads', 'membership-card.png');
            // const outputImagePath = "membership-card-final.png";
            const stream = canvas.createPNGStream();
            const out = fs.createWriteStream(outputPath);
            stream.pipe(out);
            out.on("finish", () => {
            // Send the generated image as an attachment for auto-download
            res.download(outputPath);
            res.status(200).json({ message: "downloaded" });

            });
          }

    }
    catch(error){
        res.status(500).json({ error: "Internal Server Error" });

    }
})
router.get('/',(req,res)=>{
    res.json({
        "hello":"hi sars 24"
    });
})
app.use('/api', router);

module.exports.handler=serverless(app);
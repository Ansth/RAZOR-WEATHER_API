require('dotenv').config();
const bodyParser = require('body-parser');
const express=require('express');
const mongoose=require('mongoose')
const uuid = require('uuid');
const app=express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//connection and making of schema below
mongoose
  .connect(
    `mongodb+srv://anujsinghth:${process.env.MONGO_ID}@cluster0.ezqfxvi.mongodb.net/bank?retryWrites=true&w=majority`
  )
  .then(() => app.listen(3000))
  .then(() => console.log("Running"))
  .catch((err) => console.log(err));

  const Schema=mongoose.Schema;


  const taskSchema =new Schema({
    data: {
        user_id:{
            type:Number,
            required:true,
        },
        user_name:{
            type:String,
            required:true,
        } ,
        bank_accounts:{
            type:[String],
            required:true,
        },
        id:{
            type:String,
        },
        name:{
            type:String,
        } ,
        accounts: {
            bank: 
            { 
                type: String,
            },
            branch:
            { 
                type: String, 
            },
            address: 
            { 
                type: String,  
            },
            city: 
            { 
                type: String, 
            },
            district: 
            { 
                type: String,  
            },
            state: 
            { 
                type: String, 
            },
            bank_code: 
            { 
                type: String, 
            },
            weather: 
            {
              temp: 
              { 
                type: Number, 
            },
              humidity: 
              { 
                type: Number, 
            },
          },
        },
      },
  })

  const Task=mongoose.model("Task",taskSchema)

//real

  app.post('/', async (req, res) => {
    try {
        const { user_id, user_name, bank_accounts } = req.body.data;  //getting the data provided
        // console.log(req.body.data.back_accounts[0]);
        // console.log(req.body.data.user_id)
        const existingUser = await Task.findOne({ 'data.user_id': req.body.data.user_id });  //finding  user_id
        // console.log(existingUser)

        if (existingUser===null) {  //if user_id is not present then making one with random id below

        const randomId = uuid.v4(); //for random id
        
        const firstEntryResponse = await fetch('https://ifsc.razorpay.com/' + req.body.data.bank_accounts[0]);  //taking the bank_account code to fetch API
        const firstEntryData = await firstEntryResponse.json();
        // console.log(firstEntryData.CITY);

        const secondEntryResponse = await fetch('https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city='+firstEntryData.CITY, {  //finding the weather based on city provided by razorpayAPI response
            method: 'GET',
                        headers: {
                        'X-RapidAPI-Key': process.env.API_KEY,
                        'X-RapidAPI-Host': 'weather-by-api-ninjas.p.rapidapi.com'
                        }
        });
        const secondEntryData = await secondEntryResponse.json();
        // console.log(secondEntryData.humidity);

        const task = new Task({               //Adding
            data: {
                user_id: user_id,
                user_name: user_name,
                bank_accounts: bank_accounts,
                id: randomId, 
                name: user_name, 
                accounts: {
                    bank: firstEntryData.BANK,
                    branch: firstEntryData.BRANCH,
                    address: firstEntryData.ADDRESS,
                    city: firstEntryData.CITY,
                    district: firstEntryData.DISTRICT,
                    state: firstEntryData.STATE,
                    bank_code: firstEntryData.BANKCODE,
                    weather: {
                        temp: secondEntryData.temp, 
                        humidity: secondEntryData.humidity, 
                    }
                }
            }
        });

        await task.save();

        res.status(200).json({ message: 'Task added successfully' });
    }else{
            existingUser.data.user_name = user_name;              //updating the new values provided for an existing user_id
            existingUser.data.bank_accounts = bank_accounts;
            await existingUser.save();
        res.status(200).json({ message: 'User data updated successfully' });
    }
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.get('/',async(req,res)=>{                  //showing the data entered
    const show=await Task.find({}); 
    res.json(show);

})





//testing

// app.post('/',(req,res)=>{
//     try {
//        const { user_id, user_name, bank_accounts } = req.body.data;

//      fetch('https://ifsc.razorpay.com/'+req.body.data.back_accounts[0])
//     .then(response=>response.json())
//     .then((response)=>{
//         // console.log(response);
//         city=response.CITY;
//         res.status(200);
//     }).catch (error=>
//         console.error(error)
//     )
//     fetch('https://ifsc.razorpay.com/'+req.body.data.back_accounts[0])
//     .then(response=>response.json())
//     .then((response)=>{

//          const place=response.CITY;
//          const options = {
//             method: 'GET',
//             headers: {
//                 'X-RapidAPI-Key': '',
//             'X-RapidAPI-Host': 'weather-by-api-ninjas.p.rapidapi.com'
//             }
//         };
//         fetch('https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city='+place,options)
//         .then(response=>response.json())
//         .then((response)=>{
//             console.log(response.humidity);
//             console.log(response.temp);
            
//         }).catch (error=>
//             console.error(error)
//         )
    
//         res.status(200);
//     }).catch (error=>
//         console.error(error)
//     )

//     } catch (error) {
        
//         console.log(error);
//         console.log("Cant add")
//     }
// })


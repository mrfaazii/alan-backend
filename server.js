const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path') 
const PDFDocument = require('pdfkit');
var fs = require('fs');
var bodyParser = require('body-parser');
const {corsMiddleware}= require('./api/middlewares/CORS');
const {NODE_PORT,TOKEN} = require('./api/dependents/.config.json')
app.use(corsMiddleware)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/public", express.static(path.join(__dirname, 'pdf')));
app.post('/', (req, res) => {
     console.log('req come ')
    const { count } = req.body;
    const config={ headers: {Authorization :`Token token=${TOKEN}`,Accept:'application/vnd.moonclerk+json;version=1'}}
    // axios.get(`https://api.moonclerk.com/payments?count=${count}`,config)
    axios.get(`https://api.moonclerk.com/customers?count=${count}`,config)
    .then(function (response) {
        console.log(response)
        // console.log(response.data.customers);
        // console.log(response.data.payments)
        generatePdf(response.data.customers);
        res.sendStatus(200)
        
    })
    .catch(function (error) {
        console.log(error)
    })
    .finally(function () {
    });
});
function generatePdf(result){
    console.log(result);
    // let array=[];
    const pdf  = new PDFDocument({
        layout: 'landscape',
        margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
        }
    });
    // console.log('caallling')
    let paragraphPosition ;
    pdf.pipe(fs.createWriteStream('./pdf/payments.pdf'));
    // pdf.font('fonts/BowlbyOneSC-Regular.ttf')

    //Things which required to add on the pdf page 
    //
    var name, address,city,country,zip_code,region

    // comment Code 
    //Reason is that user want to remove some conditions
    //also end point change thats why

    // for(let i =0; i< result.length; i++){
    //     // console.log(result[i].custom_fields.which_flyer_would_you_like)
    //     if(result[i].custom_fields.which_flyer_would_you_like ){
    //         if(result[i].custom_fields.plan.response.substring(5,6) >=2 && result[i].custom_fields.which_flyer_would_you_like.response != 'NO' ){
    //             array.push(result[i]);
    //         }
    //     }
      
    // } 
    // console.log(result)
    
    for(let j=0; j< result.length; j++){
        console.log('calling')
        // console.log(result[j].name + ' Index'+ j)
        // console.log(result[j])
         if(result[j].name){
            //  console.log('calling')
             name = result[j].name;
             console.log(name)
         }  if(result[j].custom_fields.country){
            country = result[j].custom_fields.country.response;
            console.log('country')
        }  if(result[j].custom_fields.zip_code){
            zip_code = result[j].custom_fields.zip_code.response;
            console.log(zip_code)
        }  if(result[j].custom_fields.state_or_region){
            region=result[j].custom_fields.state_or_region.response;
            console.log(region)
     
        }  if(result[j].custom_fields.city){
            city = result[j].custom_fields.city.response;
            console.log(city)
        } if(result[j].custom_fields.address_line_1){
            address = result[j].custom_fields.address_line_1.response;
            console.log(address)
        }
        console.log('yes!')

        if(j%3 == 0){
            paragraphPosition = pdf.y;
            if (paragraphPosition > 480) {
                pdf.addPage();
                paragraphPosition = 50;
              }
              pdf.fontSize(16)
                 .fill([103,78,167]) 
                  .font('fonts/BowlbyOneSC-Regular.ttf')
                  .text(name,50)
                  .fillColor('black')
              pdf.fontSize(16)
                  .font('Helvetica')
                  .text(address,50);
              if(region){
                if(city.length+region.length+zip_code.length < 30){
                    pdf.fontSize(16)
                    .text(city+','+region+','+zip_code, 50)
                    .text('\n')
                    
                    // console.log(pdf.y)
                  } else{
                    pdf.fontSize(16)
                    .text(city+','+region, 50);
                    pdf.fontSize(16)
                    .text(zip_code,50)
                    .text('\n')
                    
                  }
              } else{
                  console.log('here')
                if(city.length+zip_code.length < 30){
                    pdf.fontSize(16)
                    .text(city+','+zip_code, 50)
                    .text('\n')
                    
                    // console.log(pdf.y)
                  } else{
                    pdf.fontSize(16)
                    .text(city, 50);
                    pdf.fontSize(16)
                    .text(zip_code,50)
                    .text('\n')
                    
                  }
              }
           
            

        } else if(j%3 == 1){
            pdf.fontSize(16)
            .fill([103,78,167]) 
            .font('fonts/BowlbyOneSC-Regular.ttf')
            .text(name,300,paragraphPosition)
            .fillColor('black')
            pdf.fontSize(16)
            .font('Helvetica')
            .text(address,300);
            if(city.length+zip_code.length < 30){
                pdf.fontSize(16)
                .text(city+','+zip_code, 300)
                .text('\n')
               
              } else{
                pdf.fontSize(16)
                .text(city+','+region, 300);
                pdf.fontSize(16)
                .text(zip_code,300)
                .text('\n')
                
              }
        } else{
            pdf.fontSize(16)
            .fill([103,78,167]) 
            .font('fonts/BowlbyOneSC-Regular.ttf')
            .text(name,550,paragraphPosition)
            .fillColor('black')
            pdf.fontSize(16)
            .font('Helvetica')
            .text(address,550);
            if(city.length+region.length+zip_code.length < 30){
                pdf.fontSize(16)
                .text(city+','+zip_code, 550)
                .text('\n')
               
              } else{
                pdf.fontSize(16)
                .text(city+','+region, 550);
                pdf.fontSize(16)
                .text(zip_code,550)
                .text('\n')
                
              }
        }
    }
    // doc
 
   pdf.end();
    console.log('end.......');
//    return
}
app.get('/',function(req,res){
    //  = PDFGenerator.pdfGenerate(data);
    // String pdfFileName = "test_pdf";
    var filePath = "/pdf/payments.pdf";
    fs.readFile(__dirname + filePath , function (err,data){
        res.contentType("application/pdf");
        console.log(data)
        res.send(data);
    });
})
app.listen(process.env.PORT, () => {
  console.log('Example app listening on port'+process.env.PORT)
});
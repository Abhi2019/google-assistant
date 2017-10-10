'use strict';
const httpslist = require('https');
process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const itemSelected='itemSelected';
var latitude;
var longitude;
var convertObj = require('object-array-converter');
var itemList;
var item ;
// [START YourAction]
exports.firstfirebase = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


  function responseHandler (app) {
    app.ask('Hi, what would you like to do?',
    [' ', ' ', ' ']);	
  }
  function responseHandler1 (app) {
   	if (!app.isPermissionGranted()) {
    const permissions = [
				app.SupportedPermissions.DEVICE_PRECISE_LOCATION
      ];
      
      app.askForPermissions('To Show IKEA store', permissions);
     }
    else{

				let coordinates = app.getDeviceLocation().coordinates;
                latitude=coordinates.latitude;
                longitude=coordinates.longitude;
                //console.log(coordinates);
                responselist(app);

    }
  }
  function itemSelected (app) {

  
  console.log("It is just a user"+request.body.result.parameters.number);
  var i=0;
  var n=request.body.result.parameters.number-1;
  console.log("Number :"+n);
  console.log("NumberList :"+JSON.stringify(item));
   var image='https://maps.googleapis.com/maps/api/staticmap?center='+item.stores[n].latitude+','+-item.stores[n].latitude+'&zoom=12&size=100x100&maptype=roadmap&key=AIzaSyDAaDe4GgLWhfSGaw7XnkD5NvXoZojgQEE';
    var image1='https://www.google.com/maps/search/?api=1&query='+item.stores[n].latitude+','+item.stores[n].longitude;
     app.ask(app.buildRichResponse()
    // Create a basic card and add it to the rich response
    .addSimpleResponse('Click on Map button to navigate')
    .addBasicCard(app.buildBasicCard(item.stores[n].storename)
      .setTitle(item.stores[n].storename)
      .addButton('Map', image1)
      .setImage(image, 'Image alternate text')
    ))
    
  
    

  
}
  function responseHandler2 (app) {
 var intent =request.body.originalRequest.data.inputs[0].intent;

   console.log("intent printed:"+intent); 
  

  // console.log("Check the number",t);
  switch (intent) {
   
    case "actions.intent.OPTION":
 //var n=request.body.result.parameters.number-1;
 
 var str=app.getSelectedOption();
    console.log("selected options",str);

 var t=0;


 console.log("Itemlist length"+item.stores.length);
 // var itemListSelect=convertObj.toArray(item.stores);
  // t=itemListSelect.storename.indexOf(intent);
   for(var i=0;i<item.stores.length;i++){
      if(str===item.stores[i].storename){
        t=i;
       
           break;
      }
       // t++;

  }
  // //var str=request.body.result.contexts[2].parameters.OPTION;
  // console.log("The NAme is"+str);
     console.log("The t is"+t);
 var n=t;
   console.log("Number :"+n);
  //console.log("NumberList :"+JSON.stringify(item));
   var image='https://maps.googleapis.com/maps/api/staticmap?center='+item.stores[n].latitude+','+item.stores[n].longitude+'&zoom=15&size=400x100&maptype=roadmap&key=AIzaSyDAaDe4GgLWhfSGaw7XnkD5NvXoZojgQEE';
    var image1='https://www.google.com/maps/search/?api=1&query='+item.stores[n].latitude+','+item.stores[n].longitude;
     app.ask(app.buildRichResponse()
    // Create a basic card and add it to the rich response
    .addSimpleResponse('Click on Map button to navigate to '+item.stores[n].storename)
    .addBasicCard(app.buildBasicCard( 'Driving Distance: '+item.stores[n].googlemaps.distance.text )
      .setTitle(item.stores[n].storename)
      .addButton('Map', image1)
      .setImage(image, 'Google Maps')
    )
    )
    break;
    case "actions.intent.PERMISSION":
	if (app.isPermissionGranted()) {
				// permissions granted.
        console.log("getting display names and coordiantes ");
				
				let coordinates = app.getDeviceLocation().coordinates;
                latitude=coordinates.latitude;
                longitude=coordinates.longitude;
                console.log("coordiantes "+coordinates);
                responselist(app);

			}else{
			
				app.ask('Alright. Can you tell me you address please?');
			}
    break;
  }


  }
 
 function responselist (app) {

     var str='https://interikea.azurewebsites.net/api/storenearme?code=ygOROqe16rIBcaNXqmBZooxtiq0bGTv/o5aoEe1KIf9tGSedefNg8Q==&lat='+latitude+'&lng='+longitude;
     console.log(str);
       httpslist.get(str, (resp) => {
  var data = '';
  console.log("Check======");
 
  resp.on('data', (chunk) => {
    data += chunk;
   
  });


  resp.on('end', () => {
  
    item =JSON.parse(data);
   if(item.error!=undefined){
      app.tell("Sorry ! No IKEA store available near you !");
    }
    else{
    var addItems=[];
     itemList=convertObj.toArray(item.stores);
    var i=0;
  
    
    itemList.forEach(function(element) {
      
      if(i<10){

      var image1='https://www.google.com/maps/search/?api=1&query='+element.value.latitude+','+-element.value.longitude;
      var image='https://maps.googleapis.com/maps/api/staticmap?center='+element.value.latitude+','+-element.value.longitude+'&zoom=12&size=400x400&maptype=roadmap&key=AIzaSyDAaDe4GgLWhfSGaw7XnkD5NvXoZojgQEE';
      
    addItems.push(app.buildOptionItem(element.value.storename,
      [element.value.storename, element.value.storename, element.value.storename,element.value.storename])
      .setTitle(element.value.storename)
      .setDescription('Duration: '+element.value.googlemaps.duration.text+',         Driving Distance: '+element.value.googlemaps.distance.text)
      .setImage('http://www.admore-recruitment.co.uk/moreinsight/wp-content/uploads/2015/03/Ikea-Logo-1.jpg', image))
     //.setImage(image, image1))
      i++;
      }
     
    }, this);
    
    //console.log(addItems);
    app.askWithList(app.buildRichResponse()
    .addSimpleResponse('Nearest one is '+item.stores[0].storename+'and its '+item.stores[0].googlemaps.duration.text+ ' away. Click on map buttons to open map'),
  
    app.buildList('Store Locations')
    .addItems(addItems)
        );
    }
  
  });
 
}).on("error", (err) => {
  console.log("Error Message  is ====: " + err.message);
  
});


  }
  const actionMap = new Map();
	actionMap.set('input.welcome', responseHandler);
    actionMap.set('input.permission', responseHandler1);
    actionMap.set('input.permissionYes', responseHandler2);
  
  actionMap.set('input.list', responselist);
  //actionMap.set('input.select', itemSelected);
  
 	app.handleRequest(actionMap);
});
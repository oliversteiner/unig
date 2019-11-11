// Worker for Generating Styles


function generateStyles(files, style) {

  let  messageID = style;
  let text = 'Generate Images: ';
  let type = 'load';
  addMessage(text, type, messageID);

  let numberOfFileToGenerate = 0;
  let numberOfGeneratedFiles = 0;


  files.forEach(item => {

    if (!item.image[style].file_size) {
      numberOfFileToGenerate++;
    }
  });

if(numberOfFileToGenerate === 0){
  let text = 'No Images Styles for "'+ style +'"seem to be missing. ';
  let type = 'success';

  // wait 1 Sec before Message
  setTimeout( () =>{
    addMessage(text, type, messageID);
    sendCommand('stop', style );
  }, 1000);

}else {
  files.forEach(item => {

    if (!item.image[style].file_size) {

      const url = item.image[style].url;
      const name = item.file_name;

      let text = 'Generate "'+style+'" Images: for ' + name;
      let type = 'load';
      addMessage(text, type, messageID);

      getImagesAsync(url, name).then(data => {

        if (data.response.status === 404) {
          response.json().then(function(object) {
            text = 'Server Error: ' + object.message;
            type = 'error';
            addMessage(text, type);

          });
        } else if (data.response.status === 200) {

          text = 'Generate Images: for ' + data.name + '';
          type = 'load';
          addMessage(text, type, messageID);
          console.log(text);

        }
        numberOfGeneratedFiles++;
        if (numberOfGeneratedFiles >= numberOfFileToGenerate) {
          text = 'All Images Generated';
          type = 'success';
          console.log(text);
          addMessage(text, type, messageID);
          // wait 1 Sec before Message
          setTimeout( () =>{
            addMessage(text, type, messageID);
            sendCommand('stop', style );
          }, 1000);
        }
      });


    }

  });
}

}

async function getImagesAsync(url, name)
{
  let response = await fetch(url);
  let data ={name:name, response:{}};
  data.response = await response;
  return data;
}


function sendCommand(command, style, data = {}) {
  const message = {command:command , style:style, data:data};
  postMessage(message);
}

function addMessage(text, type, messageID, mode) {
  const data = {message : {text:text, type:type, messageID:messageID},mode:mode};
  postMessage(data);
}


function removeMessageByID(messageID) {
  const data = {message : {text:'', type:'', messageID:messageID},mode:'remove'};
  postMessage(data);
}


onmessage = function(event) {
  console.log('message from host:', event.data);
  const files = event.data.files;
  const style = event.data.style;
  generateStyles(files, style);

};

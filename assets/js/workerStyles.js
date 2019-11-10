// Worker for Generating Styles

function generateStyles(files) {

  console.log('generateStyles');

  const messageID = 'generate-images';
  let text = 'Generate Images: ';
  let type = 'load';
  addMessage(text, type, messageID);

  let counter = 0;
  let counter2 = 0;


  files.forEach(item => {

    if (!item.image.unig_sd.file_size) {
      counter++;
    }
  });
  console.log('Number of not generated Images: ',counter);


  files.forEach(item => {

    if (!item.image.unig_sd.file_size) {

      const url = item.image.unig_sd.url;
      const name = item.file_name;

      let text = 'Generate Images: for ' + name;
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
          const messageID = 'generate-images';
          removeMessageByID(messageID);
          addMessage(text, type, messageID);
          console.log(text);

        }
        counter2++;
        if (counter2 >= counter) {
          text = 'All Images Generated';
          type = 'success';
          console.log(text);

          removeMessageByID(messageID);
          removeMessageByID(messageID);
          addMessage(text, type);
        }
      });


    }

  });

}

async function getImagesAsync(url, name)
{
  let response = await fetch(url);
  let data ={name:name, response:{}};
  data.response = await response;
  return data;
}




function addMessage(text, type, messageID) {
  const data = {message : {text:text, type:type, messageID:messageID},mode:'add'};
  postMessage(data);
}


function removeMessageByID(messageID) {
  const data = {message : {text:'', type:'', messageID:messageID},mode:'remove'};
  postMessage(data);
}


onmessage = function(event) {
  console.log('message from host:', event.data);
  files = event.data;
  generateStyles(files);

};

(function($, Drupal, drupalSettings) {
  Drupal.behaviors.unigImageStyles = {
    project: {},
    files: [],




    attach(context) {
      $('#unig-main', context)
        .once('unig-image-styles')
        .each(() => {
          console.log('unigImageStyles loaded' );

          this.project = drupalSettings.unig.project.project;
          this.files = drupalSettings.unig.project.files;

          // load all unig_sd with no size
          const files = this.files;
          let image = new Image();
          const messageID = 'generate-images';
          let text = 'Generate Images: ';
          let type = 'load';
          Drupal.behaviors.unigMessages.addMessage(text, type, messageID);

          let counter = 0;
          let counter2 = 0;
          files.forEach(item=>{

            if(!item.image.unig_sd.file_size){
              counter++;
            }});

          console.log('Counter', counter);

          files.forEach(item=>{

            if(!item.image.unig_sd.file_size){

              console.log('No Image found for ',item.file_name );


              const url = item.image.unig_sd.url;
              const name = item.file_name;

              let text = 'Generate Images: for '+ name;
              let type = 'load';
              Drupal.behaviors.unigMessages.addMessage(text, type, messageID);

             getImagesAsync(url, name).then(data => {

                if (data.response.status === 404) {
                  response.json().then(function(object) {
                    text = 'Server Error: ' + object.message;
                    type = 'error';
                    Drupal.behaviors.unigMessages.addMessage(text, type);

                  });
                } else if (data.response.status === 200) {

                    text = 'Generate Images: for '+ data.name + '';
                    type = 'load';
                    const messageID = 'generate-images';
                    Drupal.behaviors.unigMessages.removeMessageByID(messageID);
                    Drupal.behaviors.unigMessages.addMessage(text, type, messageID);

                }
                counter2++;
               if(counter2 >= counter){
                 text = 'All Images Generated';
                 type = 'success';

                 Drupal.behaviors.unigMessages.removeMessageByID(messageID);
                 Drupal.behaviors.unigMessages.removeMessageByID(messageID);
                 Drupal.behaviors.unigMessages.addMessage(text, type);
               }
              });


            }

          });


        });
    },

  };
})(jQuery, Drupal, drupalSettings);

async function getImagesAsync(url, name)
{
  let response = await fetch(url);
  let data ={name:name, response:{}};
  data.response = await response;
  return data;
}

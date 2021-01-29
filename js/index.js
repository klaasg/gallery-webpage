const IMAGE_DIR = "content/images/";
const INITIAL_LOAD = 0; // How many categories are loaded on page load

var loaded = 0; // Keeps track of how many are loaded

function newImage(category, image) {
    let image_location = IMAGE_DIR + category.name + "/" + image;
    
    return `
       <a href="${image_location}" data-fancybox="${category.name}">
           <img src="${image_location}" alt="" class="thumbnail" />
       </a>
    `
}

$(document).ready(function() {

    imagedata.forEach(category => {
        let id = loaded + "-" + category.name;
        let load = loaded < INITIAL_LOAD;
        $("#content").append(`
            <div class="row">
              <div class="twelve columns">
                <div id="${id}" class="${load ? "" : "closed unloaded"}">
                  <h2 class="category-title">
                    <span class="open-close">${load ? "v" : "&gt;"}</span>
                    ${" " + category.title}
                  </h2>
                </div>
              </div>
            </div>
        `)
        if (load) {
            category["images"].forEach(image => {
                $(`#${id}`).append(newImage(category, image));
            });
        }
        loaded++;
    });

    $(".category-title").click(function() {
        let category_div = $(this).parent();
        if (category_div[0].classList.contains("closed")) {
            category_div.removeClass("closed");
            $(this).children().text("v");
            if (category_div[0].classList.contains("unloaded")) {
                category_div.removeClass("unloaded");
                let category = imagedata[category_div[0].id.split("-")[0]]
                category["images"].forEach(image => {
                    category_div.append(newImage(category, image));
                });
            }
        } else {
            category_div.addClass("closed");
            $(this).children().text(">");
        }
    });
});


var Actions = function(){

    this.construct = function(){
        this.setText();
        this.setIcone();
        this.validSafari();
        this.setDestaque();
        this.actionMobIconOcultar();
        this.actionMobIconMostrar();

        $('#formulario').submit(function(){
            return false;
        })
    };

    var self = this;

    this.newAlert = function(textMsg){
        Swal.fire({
            type: 'error',
            title: 'Eita, deu ruim!',
            text: textMsg,
        });
    };

    this.validUrl = function(arrayInputs){
        arrayInputs.forEach(function(value){
            value.focusout(function() {
                var regex = new RegExp('https?://.+|http?://.+');
                var url_validate = /^(http:\/.|https:\/.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

                if ((!regex.test(value.val()) || !url_validate.test(value.val())) && value.val() !== "") {
                    self.addInvalidClass(value);
                    self.newAlert("Lembre-se: Além de válido o URL deve começar com: http ou https");
                    value.val("");
                    return false;
                }
            });
            self.removeInvalidClass(value);
        });
    }

    this.validText = function(arrayInputs){
        arrayInputs.forEach(function(value){
            value.focusout(function() {
                if (value.val() == "") {
                    self.addInvalidClass(value);
                    self.newAlert('O campo "Titulo" e "Mensagem" são os únicos de preenchimento obrigatório!');
                    return false;
                }
            });
            self.removeInvalidClass(value);
        });
    }

    this.validImg = function(arrayInputs){
        arrayInputs.forEach(function(value){
            $(value).focusout(function() {     
                var regex = new RegExp('https?://.+|http?://.+');
                var img = document.createElement("img");
                img.src = value.val();

                if ((!regex.test(value.val())) && value.val() !== "") {
                    self.addInvalidClass(value);
                    self.newAlert('A URL informada não é válida, lembre-se que ela deve começar com http ou https e deve ser referente a uma imagem!');
                    value.val("");
                    return false;
                }
            });
            self.removeInvalidClass(value);
        });
    }

    this.addInvalidClass = function(value){
        value.addClass('is-invalid');
    }

    this.removeInvalidClass = function(value){
        $(value).click(function() {
            value.removeClass('is-invalid');
        });
    }

    this.setText = function(){
        var web_url = $('#web_url');
        var app_url = $('#app_url');
        var arrayInputs = [web_url, app_url];
        this.validUrl(arrayInputs);

        var titulo = $('#titulo');
        var menssagem = $('#menssagem');
        var arrayInputs = [titulo, menssagem];
        this.validText(arrayInputs);
       
        $.each(arrayInputs, function( index, value ) {
            $(value).keyup(function() {
                self.setTextView(value);
           });
       })
    };

    this.setTextView = function(value){
        $('#' + value.attr('id') + '-win-view').text(value.val());
        $('#' + value.attr('id') + '-mac-view').text(value.val());
        $('#' + value.attr('id') + '-mob-view').text(value.val());
    }

    this.setIcone = function(){
        var chrome_web_icon = $('#chrome_web_icon');
        self.validImg([chrome_web_icon]);
   
        $(chrome_web_icon).change(function() {
            self.setIconeView(false);
        });
    };

    this.setIconeView = function(isAlterar){

        var chrome_web_icon = $('#chrome_web_icon');
        var mob_icon_ocultar = $('.win-mini-chrome-icon');
        var win_mini_chrome_icon = $('.win-mini-chrome-icon');
        var chrome_web_icon_win_view = $('#chrome_web_icon-win-view');
        var chrome_web_icon_mac_view = $('#chrome_web_icon-mac-view');
        var chrome_web_icon_mob_view = $('#chrome_web_icon-mob-view');
        var chrome_web_image = $('#chrome_web_image');

        if(chrome_web_icon.val() !== ""){

            var cropImg = "";
            if(!isAlterar){
                cropImg = "?crop=0.501xw:1.00xh;0.256xw,0&amp;resize=480:*";
            }

            chrome_web_icon_win_view.attr("src", chrome_web_icon.val() + cropImg);
            chrome_web_icon_mac_view.attr("src", chrome_web_icon.val());
            chrome_web_icon_mob_view.attr("src", chrome_web_icon.val());

            mob_icon_ocultar.show();
            win_mini_chrome_icon.hide();

            if(chrome_web_image.val() == ""){
                chrome_web_icon_mob_view.show();
            }
        } else {
            chrome_web_icon_win_view.attr("src", "");
            chrome_web_icon_mac_view.attr("src", "");
            chrome_web_icon_mob_view.attr("src", "");

            mob_icon_ocultar.hide();
            win_mini_chrome_icon.show();
            chrome_web_icon_mob_view.hide();
        }
    }

    this.setDestaque = function(){
        var chrome_web_image = $('#chrome_web_image');
        self.validImg([chrome_web_image]);
        
        $(chrome_web_image).change(function() {
            self.setDestaqueView(false);
        });
    };

    this.setDestaqueView = function(isAlterar){
        var mob_conteiner = $('.mob-conteiner');
        var chrome_web_icon = $('#chrome_web_icon');
        var mob_icon_ocultar = $('.mob-icon-ocultar');
        var mob_icon_mostrar = $('.mob-icon-mostrar');
        var chrome_web_image = $('#chrome_web_image');
        var chrome_web_icon_mob_view = $('#chrome_web_icon-mob-view');
        var chrome_web_image_win_view = $('#chrome_web_image-win-view');
        var mob_conteiner_imagem_destaque = $('.mob-conteiner-imagem-destaque');

        if(chrome_web_image.val() !== ""){

            var cropImg = "";
            if(!isAlterar){
                cropImg = "?crop=0.501xw:1.00xh;0.256xw,0&amp;resize=480:*";
            }

            chrome_web_image_win_view.attr("src", chrome_web_image.val() + cropImg);
            mob_conteiner_imagem_destaque.attr("src", chrome_web_image.val());
            
            mob_icon_ocultar.show();
            mob_conteiner_imagem_destaque.show();
            mob_conteiner.height(270);
            chrome_web_icon_mob_view.hide();
        } else {
            chrome_web_image_win_view.attr("src", "");
            mob_conteiner_imagem_destaque.attr("src", "");

            mob_icon_ocultar.hide();
            mob_icon_mostrar.hide();
            mob_conteiner_imagem_destaque.hide();
            mob_conteiner.height(55);

            if(chrome_web_icon.val() !== ""){
                chrome_web_icon_mob_view.show();
            }
        }
    }

    this.actionMobIconOcultar = function(){
        var mob_conteiner = $('.mob-conteiner');
        var chrome_web_icon = $('#chrome_web_icon');
        var mob_icon_ocultar = $('.mob-icon-ocultar');
        var mob_icon_mostrar = $('.mob-icon-mostrar');
        var chrome_web_icon_mob_view = $('#chrome_web_icon-mob-view');

        mob_icon_ocultar.click(function() {
            mob_conteiner.height(55);
            mob_icon_mostrar.show();
            mob_icon_ocultar.hide();
            if(chrome_web_icon.val() !== ""){
                chrome_web_icon_mob_view.show();
            }
        });
    };

    this.actionMobIconMostrar = function(){
        var mob_conteiner = $('.mob-conteiner');
        var mob_icon_ocultar = $('.mob-icon-ocultar');
        var mob_icon_mostrar = $('.mob-icon-mostrar');
        var chrome_web_icon_mob_view = $('#chrome_web_icon-mob-view');

        mob_icon_mostrar.click(function() {
            chrome_web_icon_mob_view.hide();
            mob_conteiner.height(270);
            mob_icon_mostrar.hide();
            mob_icon_ocultar.show();
        });
    };

    this.validSafari = function(){
        var safari_icon_256_256 = $('#safari_icon_256_256');
        var safari_icon_128_128 = $('#safari_icon_128_128');
        var safari_icon_64_64 = $('#safari_icon_64_64');
        var safari_icon_32_32 = $('#safari_icon_32_32');
        var safari_icon_16_16 = $('#safari_icon_16_16');
        var arrayInputs = [safari_icon_256_256, safari_icon_128_128, safari_icon_64_64, safari_icon_32_32, safari_icon_16_16];

        self.validImg(arrayInputs);
    };

    this.construct();
}

var actions = new Actions();
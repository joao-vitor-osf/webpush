
define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';
    var connection = new Postmonger.Session();
    var payload = {};
    var authTokens = {};
    var eventDefinitionKey;
    var total;
    var schema;
    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('initActivityRunningHover', initActivityRunningHover);
    connection.on('initActivityRunningModal', initActivityRunningModal);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', save);
    connection.on('requestedSchema', function (data) {
       total = JSON.stringify(data);
        schema= JSON.stringify(data['schema']);
    });
    connection.on('requestedTriggerEventDefinition',
    function(eventDefinitionModel) {
         if(eventDefinitionModel){
            eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
            JSON.stringify(eventDefinitionModel);
        }
    });
    
    

    //connection.on('requestedInteraction', function(settings){
    //    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
    //});

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestSchema');
        connection.trigger('initActivity')
        //connection.trigger('requestInteraction');
    }

  function initActivityRunningHover(data){
      console.log(data['pushs'])
        $.get(`https://webpush-osf.herokuapp.com/envios/${data.id}`,  function(data) {
            $("#total_envios").text(data['pushs'].length);
            
            for(let i = 0;i<=data['pushs'].length;i++) {
                $.ajaxSetup({
                    headers:{
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${data['pushs'][i].values.token}`
                    }
                })
                $.get("https://onesignal.com/api/v1/notifications/"+data['pushs'][i].values.idnotificao+"?app_id="+data['pushs'][i].values.app_id, function( data ) {
                    var total_recebimentos = parseInt($("#total_recebimentos").text());
                    var total_aberturas = parseInt($("#total_aberturas").text());
                    var total_falha = parseInt($("#total_falha").text());
    
                    $("#total_recebimentos").text(total_recebimentos + data.successful);
                    $("#total_aberturas").text(total_aberturas + data.converted);
                    $("#total_falha").text(total_falha + data.failed);
                })
            }
        });
        
    }

    function initActivityRunningModal(data){
       initActivityRunningHover(data);
    }

	//É chamado quande se abre o componete dentro do SalesForce
    function initialize(data) {
        console.log('-------------------------------------------------- initialize');
        if (data) {
            payload = data;
        }
        
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};
        console.log(JSON.stringify(payload['arguments'].execute.inArguments) + 'arguments');
		//Recupera valores salvos e insere novamente nos inputs, caso tenham sido salvos
        $.each(inArguments, function (key, inArgument) {
            $.each(inArgument, function (key, val) {				
				 $('#' + key).val(val);
            });

            if(key == 'delayed_option'){
                $('#delayed_option').prop('checked', val);
             }
        });

        //Renderiza os dados na visualização
        var titulo = $('#titulo');
        var menssagem = $('#menssagem');
        actions.setTextView(titulo);
        actions.setTextView(menssagem);
        actions.setIconeView(true);
        actions.setDestaqueView(true);

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
      //  console.log(tokens);
      authTokens = tokens
    }

    function onGetEndpoints(endpoints) {
    //    console.log(endpoints);
    }

	//Salva os dados do formulário na base.
    function save() {
        console.log('-------------------------------------------------- save');       
        var titulo = $('#titulo').val();
        var menssagem = $('#menssagem').val();
        var chrome_web_icon = $('#chrome_web_icon').val();
        var chrome_web_image = $('#chrome_web_image').val();
        var web_url = $('#web_url').val();
        var app_url = $('#app_url').val();
        var safari_icon_256_256 = $('#safari_icon_256_256').val();
        var safari_icon_128_128 = $('#safari_icon_128_128').val();
        var safari_icon_64_64 = $('#safari_icon_64_64').val();
        var safari_icon_32_32 = $('#safari_icon_32_32').val();
        var safari_icon_16_16 = $('#safari_icon_16_16').val();
        var option = $('#selectClient').val();
        var selected = $.parseJSON(option);
        var delayed_option = $('#delayed_option').prop('checked');
        payload['arguments'].execute.inArguments = [
            {
                "titulo": titulo,
                "menssagem": menssagem,
                "uuid": `{{Event.${eventDefinitionKey}.player_id}}`,
                "chrome_web_icon": chrome_web_icon,
                "chrome_web_image": chrome_web_image,
                "web_url": web_url,
                "app_url": app_url,
                "safari_icon_256_256": safari_icon_256_256,
                "safari_icon_128_128": safari_icon_128_128,
                "safari_icon_64_64": safari_icon_64_64,
                "safari_icon_32_32": safari_icon_32_32,
                "safari_icon_16_16": safari_icon_16_16,
                "delayed_option": delayed_option ? "last-active" : "send_after",
                "clientSelected":selected
            }
        ];
        
        payload['metaData'].isConfigured = true;
        console.log(payload['arguments'].execute + 'arguments execute');
        connection.trigger('updateActivity', payload);
    }
});
$(document).ready(function(){
    

    $.get("https://webpush-andre.herokuapp.com/clientes", function( data ) {
        for(let i = 0;i<=data.length;i++) {
            var option = document.createElement("option");
            option.value = JSON.stringify({app_id:data[i].keys.app_id,token:data[i].values.token});
            option.innerHTML = data[i].values.nome
            $('#selectClient').append(option);
        }
    })


    // Get value on button click and show alert
    $(".btnCriar").click(function(){
        var clientName = $("#clientName").val();
        var app_id = $("#app_id").val();
        var token = $("#token").val();
        $.ajax({
            url : "https://webpush-andre.herokuapp.com/store/user",
            type : 'post',
            data :  ({
                DEKEY:"BEA1ED8A-6CC4-4157-B632-8BF4CC4D2BB7",
                items:JSON.stringify([{
                    Nome:clientName,
                    app_id:app_id,
                    token:token
                }])
            }),
            beforeSend : function(){
                console.log('enviando')
            }
       })
       .done(function(msg){
            alert("Cliente Cadastrado Com Sucesso")
            window.location.reload()
       })
       .fail(function(jqXHR, textStatus, msg){
        console.log(msg)
       });
    });
});
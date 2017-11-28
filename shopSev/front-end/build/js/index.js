socket
.on('connect', function (res) {
    console.log('connect')
})
socket.on('settlement', function () {
    alertBox('清算成功！')
    refreshData()
})



$(document)
.ready(function () {
    shopId()
    orgId()
    shopData()
    items()
});

function refreshData() {
    clean()
    shopData()
}

function clean() {
    $('.clean').remove()
}

function shopId(){
    $.post('/ID', {}, 
    (response) => {
        let orgName = (response.orgId == "H") ? "HappyGo" : "Friday"
        $(".shopId").text(response.shopId + " 特約商")
        $(".orgNameSev").text(orgName + " 特約商伺服器")
    })
}

// 不同的org產生不同的userId
function orgId(){
    $.post('/orgId', {}, 
    (response) => {
        if (response.orgId == "H"){
            var urlCss = "production/css/happygo.css"
            $('body').append('<link rel="stylesheet" type="text/css" href='+ urlCss +'>')

            var options = ""
            options += "<option>C</option>"
            options += "<option>D</option>"
            $('#users').append(options)
        }
        else{
            var urlCss = "production/css/friday.css"
            $('body').append('<link rel="stylesheet" type="text/css" href='+ urlCss +'>')

            var options = ""
            options += "<option>A</option>"
            options += "<option>B</option>"
            $('#users').append(options)
        }
        
    })
}

// 不同的shop不同的商品
function items(){
    $.post('/items', {}, 
    (response) => {
        var options = ""
        for (var i in response.items){
            var pointCash = "(" + response.items[i].point + "點／" + response.items[i].cash + "現金)"
            options += "<option value="+ i +">"+ response.items[i].itemName + pointCash +"</option>"
        }
        $('#items').append(options)
    })
}

function shopData(){
    $.post('/shopData', {}, 
    (response) => {
        $('.shopIssuePoint').text(response.issuePoint + " 點");
        $('.shopHoldPoint').text(response.holdPoint + " 點");
        $('.shopBalance').text(response.balance);
    })
}

// 特約商發出點數
$(document).on('submit', '#issuePointForm', function (event) {
    event.preventDefault()
    var issuePoint = event.target[0].value
    var userId = event.target[1].value
    $.post('/trigger/issue', {userId: userId, issuePoint: issuePoint}, 
    (response) => {
        if (response.status == "ok"){
            alertBox("成功發出" + event.target[0].value + "點")
            $(".shopIssuePoint").text(response.issuePoint + " 點")
        }
        else{
            alertBox("錯誤訊息！")
        }
    })
})  

// 特約商收到點數
$(document).on('submit', '#holdPointForm', function (event) {
    event.preventDefault()
    var itemId = event.target[0].value
    var userId = event.target[1].value

    $.post('/trigger/receive', {userId: userId, itemId: itemId}, 
    (response) => {
        if (response.status == "ok"){
            alertBox("成功收到點數")
            $(".shopHoldPoint").text(response.holdPoint + " 點")
        }
        else{
            alertBox("錯誤訊息！")
        }
    })
})  

// Alert Box
function alertBox(message){
    $("#messageAlertBox").html(message)
    $(".alert").fadeIn(2000);
    $(".alert").delay(3000);
    $(".alert").fadeOut(2000);
}

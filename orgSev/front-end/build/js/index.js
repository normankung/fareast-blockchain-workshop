socket
.on('connect', function (res) {
    console.log('connect')
})
socket.on('exchangeResult', function () {
    alertBox('使用者交換點數成功')
    refreshData()
})
// socket.on('issuePointEvent', function () {
//     alert('消費者集點成功')
//     refreshData()
// })
// socket.on('receivePointEvent', function () {
//     alert('消費者兌點成功')
//     refreshData()
// })

socket.on('Settle_Finish', function () {
    console.log('Settle_Finish')
    // alert('清算成功')
    alertBox('清算成功')
    refreshData()
    queryReportsRefresh()
})

socket.on('shopIssuePoints', function () {
    console.log('shopIssuePoints')
    alertBox('消費者集點成功')
    refreshData()
})

socket.on('shopReceivePoints', function () {
    console.log('shopReceivePoints')
    alertBox('消費者兌點成功')
    refreshData()
})

socket.on('settlementWithShops', function () {
    console.log('settlementWithShops')
    alertBox('與店家清算成功')
    refreshData()
})

socket.on('Add_Issue_Point', function () {
    console.log('Add_Issue_Point')
    alertBox('別家組織消費者兌換本組織積點成功')
    refreshData()
})

socket.on('receiveMoneyFromOrg', function () {
    console.log('receiveMoneyFromOrg')
    alertBox('收到別家組織的款項')
    // refreshData()
})

socket.on('Settlement_Report_Finish', function (data) {
    console.log('Settlement_Report_Finish')
    console.log(data)
    alertBox('報表產生 : ' + data)
    queryReportsRefresh()
})




$(document)
.ready(function () {
    orgName()
    shopsData()
    usersData()
    orgData()
    queryReports()
    // alertBox()
});

function refreshData() {    
    clean()
    shopsData()
    usersData()
    orgData()
}

function clean() {
    $('.clean').remove()
}

function queryReportsRefresh() {
    console.log("queryReportsRefresh++++++++++")
    $('.reportTable').remove()
    queryReports()
}

function orgName(){
    $.post('/orgName', {}, 
    (response) => {
        $(".orgName").text(response.orgName + " Server")
        var pic = "../production/images/" + response.orgName + ".png"
        $(".orgPic").attr("src", pic)
    })
}

function shopsData(){
    $.post('/shopsData', {}, 
    (response) => {
        for (var id in response.shopData){
            var tds = ""
            tds += "<td class=\"clean\">" + id + "</td>"
            tds += "<td class=\"clean\">" + response.shopData[id].issuePoint + "</td>"
            tds += "<td class=\"clean\">" + response.shopData[id].holdPoint + "</td>"
            
            $('#shopData-table').append(`<tr class="">` + tds + "</tr>")
            // console.log(id)
        }
    })
}

function usersData(){
    $.post('/usersData', {}, 
    (response) => {
        for (var id in response.userData){
            var tds = ""
            tds += "<td class=\"clean\">" + id + "</td>"
            tds += "<td class=\"clean\">" + response.userData[id].point + "</td>"
            $('#userData-table').append("<tr class=''>" + tds + "</tr>")
        }
    })
}

function orgData(){
    $.post('/orgData', {}, 
    (response) => {
        $('.orgIssuePoint').text(response.issuePoint);
        $('.orgBalance').text(response.balance);
    })
}

// settlement with shop
$(document).on('click', '.settlementButton', function (event) {
    $.post('/trigger/settlement',{}, 
    (response) => {
        if (response.status == "ok"){
            $('#settlementResult').append("<div class=\"clean\">清算成功</div>")
        }
        else{
            console.log(response)
            $('#settlementResult').append("清算失敗")
        }
    })
})

function settlementWithOrgButton(Phase, balance) {
    var Phase = Phase

    let buttonID = Phase + "settlementWithOrg" 
    $("#"+buttonID).replaceWith("<td id=\""+ buttonID +"\">已傳送</td>")

    $.post('/trigger/settlementWithOrg',{Phase:Phase, balance:balance}, 
    (response) => {
        if (response.status == "ok"){
            // Do Something
        }
        else{
            $("#"+removeTD).append("錯誤！請聯絡管理員！")
        }
    })
}

function queryReports(){
    $.post('/query/reports',{}, 
    (response) => {
        // console.log(response)
        if (response.status == "ok"){
            for (i in response.data.result){
                
                var btn = ""
                var Money = response.data.result[i].Me.Money
                var Phase = response.data.result[i].Phase
                if (response.data.result[i].HaveSettle != "true" && (Money < 0 || Money == 0)){
                    btn += "<button class='btn btn-sm btn-primary' type='button'"
                    btn += " onclick=\"settlementWithOrgButton(" + Phase + "," + Money + ")\"><i class=\"fa fa-money\"></i> 結清</button>"
                    
                }
                else if (response.data.result[i].HaveSettle != "true" && Money > 0){
                    btn = "等待對方付款"
                }
                else{
                    btn = "已結清"
                }

                var tds = ""
                tds += "<td>" + response.data.result[i].Phase + "</td>"
                tds += "<td>" + response.data.result[i].Me.Point + "</td>"
                tds += "<td>" + response.data.result[i].Me.Money + "</td>"
                tds += "<td>" + response.data.result[i].Target.Point + "</td>"
                tds += "<td>" + response.data.result[i].Target.Money + "</td>"
                tds += "<td id=\"" + Phase + "settlementWithOrg\">" + btn + "</td>"
                $('#report-table').append("<tr class=\"reportTable\">" + tds + "</tr>")
            }
        }
    })
}

// Alert Box
function alertBox(message){
    $("#messageAlertBox").html(message)
    $(".alert").fadeIn(2000);
    $(".alert").delay(3000);
    $(".alert").fadeOut(2000);
}

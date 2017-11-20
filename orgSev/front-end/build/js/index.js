socket
.on('connect', function (res) {
    console.log('connect')
})
socket.on('exchangeResult', function () {
    alert('使用者交換點數成功')
    refreshData()
})
socket.on('issuePointEvent', function () {
    refreshData()
})
socket.on('receivePointEvent', function () {
    refreshData()
})

socket.on('Settle_Finish', function () {
    console.log('Settle_Finish')
    alert('Settle_Finish')
    refreshData()
})

socket.on('shopIssuePoints', function () {
    console.log('shopIssuePoints')
    alert('shopIssuePoints')
    refreshData()
})

socket.on('shopReceivePoints', function () {
    console.log('shopReceivePoints')
    alert('shopReceivePoints')
    refreshData()
})

socket.on('settlementWithShops', function () {
    console.log('settlementWithShops')
    alert('settlementWithShops')
    refreshData()
})



$(document)
.ready(function () {
    orgName()
    shopsData()
    usersData()
    orgData()
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

function orgName(){
    $.post('/', {}, 
    (response) => {
        $(".orgName").text(response.orgName + " 公司")
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
        var tds = ""
        tds += "<td class=\"clean\">" + response.orgId + "</td>"
        tds += "<td class=\"clean\">" + response.issuePoint + "</td>"
        tds += "<td class=\"clean\">" + response.balance + "</td>"
        $('#orgData-table').append("<tr class=''>" + tds + "</tr>")
    })
}

$(document).on('click', '.settlementButton', function (event) {
    $.post('/trigger/settlement',{}, 
    (response) => {
        if (response.status == "ok"){
            refreshData();
            $('#settlementResult').append("<div class=\"clean\">清算成功</div>")
        }
        else{
            console.log(response)
            $('#settlementResult').append("清算失敗")
        }
    })
})

function cleanQueryTable() {
    $('.cleanQueryTable').remove()
}

function queryReport(seqNum){
    $.post('/query/report',{seqNum: seqNum}, 
    (response) => {
        if (response.status == "ok"){
            var btn = ""
            if (response.jsonFile.HaveSettle != "true"){
                seqNum = response.jsonFile.seqNum
                btn += "<button class='btn btn-sm btn-primary' type='button'"
                btn += " onclick=\"settlementWithOrgButton('" + seqNum + "'," + response.jsonFile.me.Money + ")\">結清</button>"
            }
            else{
                btn = "已結清"
            }

            var tds = ""
            tds += "<td>" + response.jsonFile.seqNum + "</td>"
            tds += "<td>" + response.jsonFile.me.Point + "</td>"
            tds += "<td>" + response.jsonFile.me.Money + "</td>"
            tds += "<td id=\"" + seqNum + "settlementWithOrg\">" + btn + "</td>"
            $('#report-table').append("<tr class=\"cleanQueryTable\">" + tds + "</tr>")
        }
        else{
            // $('#queryReportResult').append("查詢失敗")
            cleanQueryTable()
            $('#queryReportResult').append("查詢失敗")
        }
    })
}

$(document).on('submit', '#queryReport', function (event) {
    event.preventDefault()
    var i = event.target[0].value;
    queryReport(i)
})    

function settlementWithOrgButton(seqNum, balance) {
    var seqNum = seqNum.toString()

    let removeTD = seqNum + "settlementWithOrg" 
    $("#"+removeTD).replaceWith("<td>已傳送</td>")

    $.post('/trigger/settlementWithOrg',{seqNum:seqNum, balance:balance}, 
    (response) => {
        if (response.status == "ok"){
            // Do Something
        }
        else{
            $("#"+removeTD).append("錯誤！請聯絡管理員！")
        }
    })
}
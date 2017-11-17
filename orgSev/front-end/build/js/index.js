$(document)
.ready(function () {
    orgName()
    shopsData()
    usersData()
    orgData()
});

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
            tds += "<td class=\"clean\">" + response.shopData[id].holdPoint + "</td>"
            tds += "<td class=\"clean\">" + response.shopData[id].issuePoint + "</td>"
            
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
            $('#userData-table').append(`<tr class="">` + tds + "</tr>")
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
        $('#orgData-table').append(`<tr class="">` + tds + "</tr>")
    })
}
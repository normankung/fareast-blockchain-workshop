socket
    .on('connect', function (res) {
        // alert('connect')
    })
socket.on('Redeem_Finish', function (res) {
    console.log(res)
    console.log(res.userID)
    console.log(currentUser)

    if (res.userID == currentUser) {
        showRedeemHistory(currentUser)
    }
})

function alertButtonOnClick(e) {
    console.log('been clicked')
    window.alert("click")
}
function onSettleClick() {
    $.post('/settlement', {}, (response) => {
        if (response.status == 'ok') {
            alert('本期清算完成')
            userChange()
        } else {
            alert(response.result)
        }
    })
}
function onUserChange(e, e2) {
    console.log(e)
    console.log(e2)

}
var currentUser = "A"
var orgIDMap = {
    H: "Happy GO",
    F: "Friday"
}
$(document).on('submit', '#ex-form', function (event) {
    console.log('exchange')
    event.preventDefault()
    var sourceOrgID = event.target[0].value;
    var targetOrgID = event.target[1].value;
    var pointAmount = event.target[2].value;
    if (sourceOrgID == 'none' || targetOrgID == "none") {
        alert('請選擇點數種類')
    } else if (sourceOrgID == targetOrgID) {
        alert('請選擇不同的點數種類')
    } else {
        $.post('/exchange', {
            userID: currentUser,
            sourceOrgID: sourceOrgID,
            targetOrgID: targetOrgID,
            pointAmount: pointAmount
        }, (response) => {
            if (response.status == 'ok') {
                alert('點數交換成功')
                userChange()
            } else {
                alert(response.result)
            }
        })

    }

})
$(document).on('click', '.userButton', function (event) {
    console.log(event)
    console.log(event.target.innerText)
    let user = event
        .target
        .innerText
        .split(' ')[1]
    currentUser = user
    userChange()
});
function userChange() {
    clean()
    $(".userName").text("使用者 " + currentUser)
    showPoints(currentUser)
    showRedeemHistory(currentUser)
    showExchangeHistory(currentUser)
}
$(document)
    .ready(function () {

        userChange()
    });

//     <div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">     <span
// class="count_top"><i class="fa fa-user"></i> Total Users</span>     <span
// class="count_bottom"><i class="green">4% </i> From last Week</span>   </div>
function showPoints(userID) {
    $.post('/user/points', {
        userID: userID
    }, (response) => {
        if (response.status == 'ok') {
            console.log('start to append')
            for (var orgID in response.result) {
                var divContent = ""
                divContent += `<div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count clean">`
                divContent += `<span class="count_top"><i class="fa fa-money"></i> `
                divContent += orgIDMap[orgID]
                divContent += `</span>`

                divContent += `<div class="count">`
                divContent += response.result[orgID]
                divContent += ` 點 </div>`
                divContent += '</div>'
                $('#points').append(divContent)

            }
        } else {
            alert(response.result)
        }

    })
}
function clean() {
    $('.clean').remove()
}
function showRedeemHistory(userID) {
    $.post('/user/txHistory/redeem', {
        userID: userID
    }, (response) => {
        if (response.status == 'ok') {
            console.log('start to append')
            console.log(response.result)
            allTrTds = ""
            for (let i = 0; i < response.result.length; i++) {
                var mataData = JSON.parse(response.result[i].MetaData)
                var tds = ""
                tds += "<td class=\"clean\">" + (i + 1) + "</td>"
                tds += "<td class=\"clean\">" + mataData.ProductID + "</td>"
                tds += "<td class=\"clean\">" + mataData.Price + "</td>"
                tds += "<td class=\"clean\">" + mataData.Point + "</td>"
                tds += "<td class=\"clean\">" + mataData.Summary + "</td>"
                tds += "<td class=\"clean\">" + response.result[i].Date + "</td>"

                allTrTds += `<tr class="even pointer clean">` + tds + "</tr>"
            }
            $('#redeem-table').html(allTrTds)
        }

    })
}

function showExchangeHistory(userID) {
    $.post('/user/txHistory/exchange', {
        userID: userID
    }, (response) => {
        if (response.status == 'ok') {
            console.log('start to append')
            console.log(response.result)

            for (let i = 0; i < response.result.length; i++) {
                var mataData = JSON.parse(response.result[i].MetaData)
                var tds = ""
                tds += "<td class=\"clean\">" + (i + 1) + "</td>"
                tds += "<td class=\"clean\">" + orgIDMap[mataData.SourceOrgID] + "</td>"
                tds += "<td class=\"clean\">" + orgIDMap[mataData.TargetOrgID] + "</td>"
                tds += "<td class=\"clean\">" + mataData.ExChangeAmount + "</td>"
                tds += "<td class=\"clean\">" + mataData.TargetPointBalance + "</td>"
                tds += "<td class=\"clean\">" + response.result[i].Date + "</td>"

                $('#exchange-table').append(`<tr class="even pointer clean">` + tds + "</tr>")

            }
        }

    })
}
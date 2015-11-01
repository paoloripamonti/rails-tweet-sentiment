//Resizavle Elemnt
$('.resizable').resizable();

//Reload Page
$('.reload-page').click(function() {
  location.reload();
});

// Catch the enter button and submit tweet via ajax
$("#new-search-form").keypress(function(e) {
  if (e.which == 13) {
    e.preventDefault();
    analizeTweet();
  }
});

// Catch the enter button and submit token via ajax
$("#token-field").keypress(function(e) {
  if (e.which == 13) {
    e.preventDefault();
    checkToken();
  }
});


// Click button for check token
$(".btn-token").click(function(){
  checkToken();
});

//Check token validity
//If success, return can analize tweet
//If error, show message
function checkToken(){
  if($("#token-field").val()!=""){
    clearOldTokenSearch();
    showSearchTokenBtn();
    $.ajax({
      type: "POST",
      url: "/api/v1/token",
      dataType: "JSON",
      data: {token: $("#token-field").val() },
      success: function(data){
        $("#token").val('Token token="'+data+'"')
        $("#check-token").hide()
        $("#search-tweet").fadeIn(200)
        showSuccessMessageToken();
      },
      error: function(errMsg) {
        showTokenErrorMessage(); 
        showCheckTokenBtn();
      }
    })
  }else{
    showTokenErrorMessage();
    showCheckTokenBtn();
  }
  return false;
}

// Click button for submit text
$(".btn-search").click(function(){
  analizeTweet();
});

//Submit for to server
//If success, return JSON array
//If error, show message
function analizeTweet(){
  if($("#token").val()==""){
    showTokenErrorMessage();
  }else{
    if($("#text").val()!=""){
      clearOldSearch()
      showRefreshIconBtnSearch()
      showLoadInPanel()
      $.ajax({
        type: "POST",
        headers: { 'Authorization': $("#token").val() },
        url: "/api/v1/search",
        dataType: "JSON",
        data:  $("#new-search-form").serialize(),
        success: function(data){
          processData(data)
          showSearchIconBtnSearch()
          getInfo()
        },
        error: function(errMsg) {
          showWErrorMessage(); 
          showCheckTokenBtn();
          showSearchIconBtnSearch();
        }
      })
    }else{
      clearOldSearch()
      showWarningMessage()
    }
  }
  return false;
}

// Get account info
function getInfo(){
  $.ajax({
    type: "GET",
    headers: { 'Authorization': $("#token").val() },
    url: "/api/v1/info",
    dataType: "JSON",
    success: function(data){
      $("#info-chart-panel").fadeIn(200)
      showInfo(data)
    },
    error: function(errMsg) {
      clearInfo()
    }
  })
}

//Clear body
function clearOldSearch(){
  $(".panel-primary").fadeOut(200)
  $("#trend-body-loader").fadeIn(200)
  $("#keywords-body-loader").fadeIn(200)
  $("#tag-cloud-body-loader").fadeIn(200)
  $("#trend-body").html("")
  $("#tag-cloud-body").html("")
  $("#keywords-body").html("")
  $(".alert-sentiment").fadeOut(200)
  $("#no-data-found").hide()
  $(".btn-show-raw-result").hide()
  $("#geocode-tweet-body").html("")
  clearInfo()
}

//Show search icon
function showLoadIconBtnSearch(){
  $(".btn-search").html('<span class="fa fa-search"></span>')
}

//Show
function showCheckTokenBtn(){
  $(".btn-token").html('<span class="fa fa-chevron-right"></span>')
}

//Show Token Error Message
function showTokenErrorMessage(){
  $("#token-error-alert").fadeIn(200)
}

function clearOldTokenSearch(){
  $("#token-error-alert").fadeOut(200)
}

//Show load icon into Panel
function showLoadInPanel(){
  $("#trend-body-load").show()
  $("#tag-cloud-body-load").show()
  $("#keywords-body-load").show()
}


//Show default search icon
function showSearchIconBtnSearch(){
  $(".btn-search").html('<i class="fa fa-search"></i>')
}

//Show refresh icon
function showRefreshIconBtnSearch(){
  $(".btn-search").html('<i class="fa fa-refresh fa-spin"></i>')
}

//Show check token button
function showSearchTokenBtn(){
  $(".btn-token").html('<i class="fa fa-refresh fa-spin"></i>')
}

//Show Success Token Validation
function showSuccessMessageToken(){
  $("#success-token-alert").show()
  setTimeout(function() {
  $("#success-token-alert").fadeTo(500, 0).slideUp(500, function(){
    $(this).remove(); 
  });
}, 500);
}

//Show warning message
function showWarningMessage(){
  $(".panel-primary").fadeOut(200)
  $("#twitter-warning-alert").fadeIn(200)
    setTimeout(function(){
      $("#twitter-warning-alert").fadeOut(200)
    }, 2000);
}

//Show Twitter error message
function showWErrorMessage(){
  $("#twitter-error-alert").fadeIn(200)
    setTimeout(function(){
      $("#twitter-error-alert").fadeOut(200)
    }, 5000);
}

//Process Data
function processData(dataSource){
  if(dataSource == null || dataSource==[] || dataSource.length==0){
    $("#no-data-found").fadeIn(400)
  }else{
    processAlertSentiment(dataSource)
    processTextTags(dataSource)
    processKeywords(dataSource)
    processTrend(dataSource)
    processRawJSONResults(dataSource)
    $(".panel-primary").show()
    processGeocodeChart(dataSource)
  }
}

//Process Alert Sentiment
function processAlertSentiment(dataSource){
  dataSourceLen = dataSource.length;
  sentimentSum = 0.0;
  for(i=0;i<dataSourceLen;i++){
    sentimentSum+=dataSource[i]["sentiment"]
  }
  sentimentAvg = sentimentSum/dataSourceLen
  roundedAvg = (sentimentAvg*100).toFixed(2)
  $(".alert-sentiment-percent").html("( "+roundedAvg+"% )")
  if( sentimentAvg < 0.40){ 
    $(".alert-sentiment").removeClass("alert-neutral")
    $(".alert-sentiment").removeClass("alert-positive")
    $(".alert-sentiment").addClass("alert-negative")
    $(".alert-sentiment-icon").removeClass("fa-meh-o")
    $(".alert-sentiment-icon").removeClass("fa-smile-o")
    $(".alert-sentiment-icon").addClass("fa-frown-o")
    $(".alert-sentiment-label").html("NEGATIVE")
  } else {
    if( sentimentAvg > 0.60){
      $(".alert-sentiment").removeClass("alert-neutral")
      $(".alert-sentiment").removeClass("alert-negative")
      $(".alert-sentiment").addClass("alert-positive")
      $(".alert-sentiment-icon").removeClass("fa-meh-o")
      $(".alert-sentiment-icon").removeClass("fa-frown-o")
      $(".alert-sentiment-icon").addClass("fa-smile-o")
      $(".alert-sentiment-label").html("POSITIVE")
    } else {  
      $(".alert-sentiment").removeClass("alert-positive")
      $(".alert-sentiment").removeClass("alert-negative")
      $(".alert-sentiment").addClass("alert-neutral")
      $(".alert-sentiment-icon").removeClass("fa-smile-o")
      $(".alert-sentiment-icon").removeClass("fa-frown-o")
      $(".alert-sentiment-icon").addClass("fa-meh-o")
      $(".alert-sentiment-label").html("NEUTRAL")
    }
  }
  $(".alert-sentiment").fadeIn(200)
}

function processTextTags(dataSource){
  arr = []
  dataSourceLen = dataSource.length;
  for(i=0;i<dataSourceLen;i++){
    jQuery.each(dataSource[i]["text_tags"], function(text, weight) {
      hash = {}
      text = text.split("_").join(" ")
      obj = $.grep(arr, function(e){ return e.text == text; })
      if(obj.length == 1){
        obj[0].weight = (obj[0].weight+parseFloat((weight*100).toFixed(2)))/2
      }else{
        hash["text"] = text
        hash["weight"] = parseFloat((weight*100).toFixed(2))
        arr.push(hash);
      }
    })
  }
  $("#tag-cloud-body").jQCloud(arr,{width: 600,height: 400});
  $("#tag-cloud-body-loader").hide()
  $("#tag-cloud-body").css({"width":"100%","height":"70%","overflow-x":"scroll","overflow-y":"scroll"})
  $("#tag-cloud-body").fadeIn(200)
}

function processKeywords(dataSource){
  arr = []
  dataSourceLen = dataSource.length;
  for(i=0;i<dataSourceLen;i++){
    jQuery.each(dataSource[i]["keywords"], function(text, weight) {
      hash = {}
      text = text.split("_").join(" ")
      obj = $.grep(arr, function(e){ return e.text == text; })
      if(obj.length == 1){
        obj[0].weight = (obj[0].weight+parseFloat((weight*100).toFixed(2)))/2
      }else{
        hash["text"] = text
        hash["weight"] = parseFloat((weight*100).toFixed(2))
        arr.push(hash);
      }
    })
  }
  $("#keywords-body").jQCloud(arr,{width: 600,height:400});
  $("#keywords-body-loader").hide()
  $("#keywords-body").css({"width":"100%","height":"70%","overflow-x":"scroll","overflow-y":"scroll"})
  $("#keywords-body").fadeIn(200)
}

// Show trend line chart
function processTrend(dataSource){
  arr = []
  date_arr = []
  sentiment_arr = []
  tweet_ids = []
  dataSourceLen = dataSource.length;
  for(i=0;i<dataSourceLen;i++){
    sentiment = dataSource[i]["sentiment"]
    date_arr[i] = new Date(dataSource[i]["created_at"])
    sentiment_arr[i] = parseFloat(sentiment.toFixed(2))
    tweet_ids[i] = dataSource[i]["id_str"]
  }  
  dataSourceLen = dataSource.length;
  sentimentSum = 0.0;
  for(i=0;i<dataSourceLen;i++){
    sentimentSum+=dataSource[i]["sentiment"]
  }
  sentimentAvg = sentimentSum/dataSourceLen
  var chart = c3.generate({
    bindto: '#trend-body',
    data: {
        x: 'x',
        columns: [
            ['x'].concat(date_arr),
            ['sentiment'].concat(sentiment_arr)
        ],
        onclick: function (dot, i) { showTweetModal(tweet_ids[dataSourceLen-dot["index"]-1], dot["value"], dataSource[dataSourceLen-dot["index"]-1]) }
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%d/%m/%Y %H:%M'
            }
        }
    },
    grid: {
      y: {
          lines: [{value: parseFloat(sentimentAvg.toFixed(2)), text: 'Average'}]
      }
    }
  });
  $("#trend-body-loader").hide()
  $("#trend-body").css("overflow-x","scroll")
  $("#trend-body").css("max-height","100%")
  $("#trend-body").fadeIn(200)
}

//Show All Info
function showInfo(data){
  showInfoChart(data);
  showInfoText(data);
}

// Show Info chart
function showInfoChart(data){
  var chart = c3.generate({
    bindto: '#info-chart-panel-body',
    data: {
        columns: [
            ['Request Executed', parseInt(data["tot_request_executed"])],
            ['Request Avaiable', parseInt(data["request_avaiable"])],
        ],
        type : 'donut'
    },
    donut: {
        title: "Monthly Request"
    }
  });
}

// Show info Text
function showInfoText(data){
  $("#range_start_at").html(data["range_start_at"])
  $("#range_end_at").html(data["range_end_at"])
  $("#max_monthly_request").html(data["max_monthly_request"])
  $("#tot_request_executed").html(data["tot_request_executed"])
  $("#request_avaiable").html(data["request_avaiable"])
}

// Clear info Text
function clearInfo(){
  $("#info-chart-panel").hide()
  $("#range_start_at").html("...")
  $("#range_end_at").html("...")
  $("#max_monthly_request").html("...")
  $("#tot_request_executed").html("...")
  $("#request_avaiable").html("...")
}

// Show modal details
function showTweetModal(tweetId, sentiment){
  $("#tweet-iframe-title").html(" ( Sentiment: "+(parseFloat(sentiment)*100).toFixed(0)+"% )")
  basic_url = "http://twitframe.com/show?url=https://twitter.com/tweet/status/"+tweetId
  $("#tweet-iframe-detail").attr("src", basic_url)
  $("#tweet-modal-detail").modal()
}

// On close modal, clear IFRAME
$('#tweet-modal-detail').on('hidden.bs.modal', function () {
  $("#tweet-iframe-detail").html("")
})

//Show raw JSON Results
function processRawJSONResults(dataSource){
  $(".btn-show-raw-result").show()
  $("#tweet-raw-json-body").html(JSON.stringify(dataSource, null, 4))
}

//Show modal raw JSON
$(".btn-show-raw-result").click(function(){
  $("#tweet-raw-json").modal()
});

//Process Geocode Chart and display panel
function processGeocodeChart(dataSource) {
  data = {}
  dataSourceLen = dataSource.length;
  for(i=0;i<dataSourceLen;i++){
    geocode = dataSource[i]["geocode"]
    key = Object.keys(geocode)[0]
    value = geocode[0]
    if(data[key]!=null){
      data[key]=data[key]+1
    }else{
      data[key]=1
    }
  }
  //World map by jvectormap
  $('#geocode-tweet-body').vectorMap({
    map: 'world_mill_en',
    series: {
      regions: [{
        values: data,
        scale: ['#C8EEFF', '#0071A4'],
        normalizeFunction: 'polynomial'
      }]
    },
    onRegionTipShow: function(e, el, code){
      el.html('Number of tweet from "'+el.html()+'" user: "'+data[code]+')');
    }
  });
}
$(function() {
    $("#social-button-container .twitter").socialbutton("twitter", {
        button : "horizontal",
        text : "毎日の気分を記録するアプリ「picob」",
        url : "http://picob.net",
    }).width(95);

    $("#social-button-container .facebook").socialbutton("facebook_like", {
        button : "button_count",
        url : "http://picob.net",
    }).width(110);

    $("#social-button-container .hatena").socialbutton("hatena", {
        button : "standard",
        url : "http://picob.net",
        title : "picob",
    }).width(70);
});

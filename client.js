// utility functions

util = {
    urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,

    //  html sanitizer
    toStaticHTML: function (inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    },

    //pads n with zeros on the left,
    //digits is minimum length of output
    //zeroPad(3, 5); returns "005"
    //zeroPad(2, 500); returns "500"
    zeroPad: function (digits, n) {
        n = n.toString();
        while (n.length < digits)
            n = '0' + n;
        return n;
    },

    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    timeString: function (date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },
    dateString: function (d) {
        var h = this.zeroPad(2, d.getHours());
        var m = this.zeroPad(2, d.getMinutes());
        var s = this.zeroPad(2, d.getSeconds());
        var yy = d.getFullYear();
        var mm = this.zeroPad(2, d.getMonth() + 1);
        var dd = this.zeroPad(2, d.getDate());
        return yy + "-" + mm + "-" + dd + " " + h + ":" + m + ":" + s
    },

    //does the argument only contain whitespace?
    isBlank: function (text) {
        var blank = /^\s*$/;
        return (text.match(blank) !== null);
    }
};

function updateRSS(rss) {
    var bytes = parseInt(rss);
    if (bytes) {
        var megabytes = bytes / (1024 * 1024);
        megabytes = Math.round(megabytes * 10) / 10;
        $("#rss").text(megabytes.toString());
    }
}

//submit a new message to the server
function send() {
    jQuery.get("/send", {
        to: $("#to").attr("value"),
        subject: $("#subject").attr("value"),
        text: $("#text").val()
    }, function (data) {

    }, "json");
}

//Transition the page to the state that prompts the user for a nickname
function showConnect() {
    $("#connect").show();
    $("#loading").hide();
    $("#body").hide();
}

//transition the page to the loading screen
function showLoad() {
    $("#connect").hide();
    $("#loading").show();
    $("#body").hide();
}

//transition the page to the main chat view, putting the cursor in the textfield
function showForm() {
    $("#connect").hide();
    $("#loading").hide();
    $("#body").show();
}

//get a list of the users presently in the room, and add it to the stream
function status() {
    jQuery.get("/status", {}, function (data, status) {
        starttime = new Date(data.starttime);
        rss = data.rss;
        updateRSS(rss);
        $("#uptime").text(starttime);
    }, "json");
}

$(document).ready(function () {
    $("#submit").click(function () {
        showLoad();
        $.ajax({
            type: "GET" // XXX should be POST
            , dataType: "json"
            , url: "/join"
            , data: {email: $("#email").attr("value")}
            , error: function (data) {
                console.error(data);
                alert(data.response);
                showConnect();
            }
            , success: function (data){
                console.log(data);
                showForm();
            }
        });
        return false;
    });
    $("#send").click(function () {
        showLoad();
        $.ajax({
            type: "GET" // XXX should be POST
            , dataType: "json"
            , url: "/send"
            , data: {
                to: $("#to").attr("value"),
                subject: $("#subject").attr("value"),
                text: $("#text").val()
            }
            , error: function (data) {
                console.error(data.response);
                alert(data.response);
                showForm();
            }
            , success: function (data){
                console.log(data);
                alert(data.response);
                showForm();
                $("#text").val("");
            }
        });
        return false;
    });
    showConnect();
    status();
});

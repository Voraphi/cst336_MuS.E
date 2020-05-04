alert("hmm");

$( document ).ready(function() {
    console.log("wya");
    
    $("#search-lyrics").on("click", function () {
        var title = $("#title");
        var artist = $("#artist");
        
        var str = artist + " " + title;
        str = str.replace(" ", "%20");
        
        $.ajax({
           url : "https://api.audd.io/findLyrics/?q=" + str,
           type : "GET",
           dataType : "json",
           
            success: function(data) {
    			data.result.forEach(function(possibleSong) {
    			   $("#lyrics").append(possibleSong.lyrics);
    			   $("#lyrics").append("\n\n\n\n");
    			   console.log(data);
    			});
    		},
        	error: function(error) {
        	    $("#lyrics").append("<h1> Sorry No Lyrics Found :( </h1>");
        	    $("#lyrics").css("text-color", "red");
    		    console.log(error);
    	    }
        
        });
        // var data = {
        //     'url': 'https://audd.tech/example1.mp3'
        //     'api_token': 'test'}
        
        // $.getJSON('https://api.audd.io/?jsonp=?', data, function(result){
        //     console.log(result);
        // });

        });
    
});


// Userlist data array for filling in info box
var userListData = [];
var username = '';
// DOM Ready =============================================================
$(document).ready(function() {

    //get user name
    username = prompt("Enter user name (This is not yet secure!)","nick");

    //turn the selects into editable selects
    //  populateOptions();
    // Populate the user table on initial page load
    populateTable();
    /*// Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
    // Add User button click
    $('#btnAddUser').on('click', addUser);
    // Delete User link click
    $('#userList').on('click', 'a.linkdeleteuser', deleteUser);

    // Add batch User button click
    $('#btnAddBatchUser').on('click', addBatchUser);*/

    // Add "addEntry"
    $('#btnAddEntry').on('click', addEntry);

    //DeleteEntry, is this 
    $('#userList').on('click', 'a.linkdeleteentry', deleteEntry);
	//same as:
    /*no it isnt!
    $('.linkdeleteentry').on('click', function(){
        deleteEntry();
    });*/


    $('#linkpopulatetable').on('click', function(){
        //'pull entry list from server'
        populateTable();
    });

    $('#btnSearchEntry').on('click',function(){
        searchEntry();
		document.getElementById("statusSpan").innerHTML = "Search complete. ";
    });

    $('#linksyncentries').on('click', function(){
        syncEntries();
    });

    $('#linkclearentries').on('click', function(){
        localStorage.clear();
		updateTable(localStorage);
		document.getElementById("statusSpan").innerHTML = "Local storage cleared.";
    });
    $('#linkupdatelocal').on('click', function(){
        updateTable(localStorage);
		document.getElementById("statusSpan").innerHTML = "Update complete.";
    });

    runMetrics();
});

// Functions =============================================================

function runMetrics(){
    console.log("running metrics");
    var nounList = {};
    var verbList = {};
    var adjeList = {};

    //combine into object so i dont have to a function each for verb,noun, adje
    //cool hack
    var nva      = {
        'nouns' : nounList,
        'verbs' : verbList,
        'adjectives' : adjeList
    };

    //gather the frequency of each entry
    //store it as nva[nouns]['We'] = 12hits;

    $.each(localStorage,function(indexInArray,valueOfElement){
        var x;
        var doit = function(t){
            x = JSON.parse(valueOfElement)[t];
            //console.log('doit() x:'+x+' t:'+t+' nva:'+JSON.stringify(nva)+' nva.t:'+nva.t+' nva[t]:'+JSON.stringify(nva[t]));
            //in each, noun, verb adjective, count the occurances of a given string
            if(x){
                if(nva[t][x]){
                    nva[t][x] = nva[t][x] + 1;
                }else{
                    nva[t][x] = 1;
                }
            }
        }
        doit('nouns');
        doit('verbs');
        doit('adjectives');
    });//end each
    //localStorage['nva']=JSON.stringify(nva);

    //console.log("adje metrics: "+JSON.stringify(nva.adjectives));
    console.log("noun metrics: "+JSON.stringify(nva.nouns));
    //console.log("verb metrics: "+JSON.stringify(nva.verbs));

    //sort by values (not keys)
    var keysSorted =[];
    var verbTop10  =[];
    var nounTop10  =[];
    var adjectivesTop10  =[];


    var k;
    keysSorted = Object.keys(nounList).sort(function(a,b){return nounList[a]-nounList[b]})
    for(var i = 0; i<20 ; i++){
        k = keysSorted.pop()
        if(k)
            nounTop10[i] = k;
    }

    keysSorted = Object.keys(verbList).sort(function(a,b){return verbList[a]-verbList[b]})
    for(var i = 0; i<20 ; i++){
        k = keysSorted.pop()
        if(k)
            verbTop10[i] = k;
    }

    keysSorted = Object.keys(adjeList).sort(function(a,b){return adjeList[a]-adjeList[b]})
    for(var i = 0; i<20 ; i++){
        k = keysSorted.pop()
        if(k)
            adjectivesTop10[i] = k;
    }

    populateOptions(nounTop10,verbTop10,adjectivesTop10);
}


function populateOptions(nounsList,verbsList,adjectivesList){
    //keep track of the dropdown's options
    //var nounsList = [];
    //var verbsList = [];
    //var adjectivesList = [];

    //clear existing options and create the 'ANY' keyword option
    $('#selectInputNouns').html('');					//clear the options list
    $('#selectInputNouns').append('<option value="">ANY</option>');	//the first option is the ANY keyword
    $('#selectInputVerbs').html('');
    $('#selectInputVerbs').append('<option value="">ANY</option>');
    $('#selectInputAdjectives').html('');
    $('#selectInputAdjectives').append('<option value="">ANY</option>');

    //each here

    //add to select 'options' but only if it doesnt already exist (update: doesnt matter since we're getting top10 now)
    $.each(nounsList,function(iiA,voE){
        //console.log("appending"+iiA+ " " +voE);
        $('#selectInputNouns').append('<option value="'+voE+'">'+voE+'</option>');
    });
    $.each(verbsList,function(iiA,voE){
        $('#selectInputVerbs').append('<option value="'+voE+'">'+voE+'</option>');
    });
    $.each(adjectivesList,function(iiA,voE){
        $('#selectInputAdjectives').append('<option value="'+voE+'">'+voE+'</option>');
    });
    /****        if(verbsList.indexOf(entry.verbs) === -1 ){
            verbsList.push(entry.verbs);
            $('#selectInputVerbs').append('<option value="'+entry.verbs+'">'+entry.verbs+'</option>');
        }
        if(adjectivesList.indexOf(entry.adjectives) === -1 )      {
            adjectivesList.push(entry.adjectives);
            $('#selectInputAdjectives').append('<option value="'+entry.adjectives+'">'+entry.adjectives+'</option>');
        }
****/
    //end each

    //if the dropdowns only have 2 options, than put the non-'ANY' at the top
    if(nounsList.length === 1)
    {
        var lastValue = $('#selectInputNouns option:last-child').val();
        $('#selectInputNouns option[value="'+lastValue+'"]').remove();
        $('#selectInputNouns').prepend('<option value="'+lastValue+'">'+lastValue+'</option>');
    }
    if(verbsList.length === 1)
    {
        var lastValue = $('#selectInputVerbs option:last-child').val();
        $('#selectInputVerbs option[value="'+lastValue+'"]').remove();
        $('#selectInputVerbs').prepend('<option value="'+lastValue+'">'+lastValue+'</option>');
    }
    if(adjectivesList.length === 1)
    {
        var lastValue = $('#selectInputAdjectives option:last-child').val();
        $('#selectInputAdjectives option[value="'+lastValue+'"]').remove();
        $('#selectInputAdjectives').prepend('<option value="'+lastValue+'">'+lastValue+'</option>');
    }

    var selectBoxNouns      =       $("#selectInputNouns");//.editableSelect();
    var selectBoxVerbs      =       $("#selectInputVerbs");//.editableSelect();
    var selectBoxAdjectives =  $("#selectInputAdjectives");//.editableSelect();
    selectBoxNouns.change(function(){
        //      console.log("Nouns: "+selectBoxNouns.val());
        $("#inputNouns").val(selectBoxNouns.val());
    });
    selectBoxVerbs.change(function(){
        //        console.log("Verbs: "+selectBoxVerbs.val());
        $("#inputVerbs").val(selectBoxVerbs.val());
    });
    selectBoxAdjectives.change(function(){
        //    console.log("Adje: "+selectBoxAdjectives.val());
        $("#inputAdjectives").val(selectBoxAdjectives.val());
    });
    //selectBoxOne.restoreSelect();//dont know what this was supposed to do

}
function searchEntry(){
    event.preventDefault();
    /*used to have seperate 'search' section, now it uses the 'input' section with a search button.
    var n = $('#selectSearchNouns      option:selected').val();
    var v = $('#selectSearchVerbs      option:selected').val();
    var a = $('#selectSearchAdjectives option:selected').val();
    */
    //val() returns '' if the input is empty
    var n = $('#inputNouns').val();
    var v = $('#inputVerbs').val();
    var a = $('#inputAdjectives').val();

    //build the query object, this gets passed straight through to db.find()
    //so only define selectedOptions.verbs if we are searching for it.
	/**** UPDATE: 3/4/2014 Since we are NOT quering mongo, we don't need the query object.
    var selectedOptions = {};
    //the 'ANY' option has value ''
    if(n!==''){
        selectedOptions.nouns      = n;
    }
    if(v!==''){
        selectedOptions.verbs      = v;
    }
    if(a!==''){
        selectedOptions.adjectives = a;
    }****/
    /**** 2014-02-24 Switched to localStorage search
    selectedOptions = jQuery.param(selectedOptions);
    $.getJSON( '/entrylist?'+selectedOptions, function( data ) {
        updateTable(data,selectedOptions);
    });
    ****/
    console.log("searching"+/*JSON.stringify(selectedOptions)+*/" "+n+" "+v+" "+a);

    var results = [];
    $.each(localStorage,function(indexInArray,valueOfElement){
        //since its working on localStorage, valueOfElement is a JSON string already
        var voe = JSON.parse(valueOfElement);
        //if(options.nouns is undefined, than nouns doesnt block search.
        //If options.nouns is defined, then check voe.nouns = n, if true, then dont block,
        //else block search and abort the query.
        //Same goes for verbs and adjectives.
        //If true makes it all the way to the end, then you have an entry that matches all the defined fields and wildcards the undefined ones :)
        if(( n === '' || voe.nouns.indexOf(n) > -1 ) && ( v === '' || voe.verbs.indexOf(v) > -1) && ( a === '' || voe.adjectives.indexOf(a) > -1)){
            //console.log("found match"+valueOfElement);
            results.push(valueOfElement);
        }
    });
    //got the results, so update the table
    updateTable(results);
}

//'push new entries to server'
function syncEntries(){

    //    take all entries in webstorage and POST them to the mongo

    //then get all the entries back from mongo
    console.log("sync ing");
    $.each(localStorage,function(indexInArray, valueOfElement){
        //        console.log("syncEntries index:"+indexInArray+" voe "+valueOfElement);
        //localstorage is always a string
        var entry;
        if(valueOfElement)
            entry = JSON.parse(valueOfElement);
        else{
            console.log("skipping "+indexInArray);
            return false;
        }
        //if it doenst have an '_id' that means it has never been into mongo, so add it
        if(!entry._id){
            console.log("Found a local"+JSON.stringify(entry));
            // Use AJAX to post the object to our adduser service
            $.ajax({
                       type: 'POST',
                       data: entry,
                       url: 'http://icefishing.dyndns.org:8080/addentry',
                       dataType: 'JSON',
                       success: function(msg){
                           console.log("Post succeeded msg:"+JSON.stringify(msg));
                       },
                       error: function(XMLHttpRequest,textStatus,errorThrown){
                           /*alert("POST error xml:"+JSON.stringify(XMLHttpRequest)+" text status:'"+textStatus+"' errorThrown:'"+errorThrown+"'");*/
						   document.getElementById("statusSpan").innerHTML = "Push failed! Couldn't connect to server. Running locally";
						   
                       }
                   }).done(function( response ) {
                       //get here if the POST succeeds, 'response' is from backend db

                       // Check for successful (blank) response
                       if (response.msg === '') {

                           // Clear the form inputs
                           // $('#addUser   input').val('');

                           /** old way
                           //since we successfully pushed everything, we can now clear the local storage
                           //clear the local storage and download a new one
                           localStorage.clear();
                           $.getJSON( '/entrylist', function(data){
                               $.each(data,function(indexInArray,valueOfElement){
                                   localStorage[indexInArray] = JSON.stringify(valueOfElement);
                                   //                                   console.log("got json, looping"+indexInArray);

                               });
                               //getJSON is Asynchronous, so it immediatly prints to console and waits to updateTable
                               // Update the table (happens after it saves to localStorage)
                               //but it must be inside the getJSON callback function
                               updateTable(localStorage);
                           });
                           *** end old way */

                           //since we pushed succesfully, remove the newly added element from local storage so it doesnt
                           //get added twice
                           localStorage.removeItem(indexInArray);

                           //new way is just to call populate table, which takes care of the ajax call
                           populateTable();
                           document.getElementById("statusSpan").innerHTML = "Push complete.";

                           console.log("ajax and mongo success!");
                       }
                       else {
                           // If something goes wrong, alert the error message that our service returned
                           alert('Backend DB Error: ' + response.msg);
                       }
                   });//end ajax
        }
    });

}

function addEntry(){
    event.preventDefault();
    /*looks like this
    {"timeStamp": "2013-01-25_09-38-41",
        "nouns"     : "Mahtab",
        "verbs"     : "went",
        "adjectives": "to the park"}
    *end object example*/

    var isodate = new Date();
    var newEntry = {
        'user'      : username,
        'nouns'     : $('#addEntry input#inputNouns').val(),
        'verbs'     : $('#addEntry input#inputVerbs').val(),
        'adjectives': $('#addEntry input#inputAdjectives').val(),
        'timeStamp' : isodate.toISOString()
    };
    console.log("saving to local newnetry:"+JSON.stringify(newEntry));
    localStorage[isodate.toISOString()] = JSON.stringify(newEntry);
    runMetrics();
    updateTable(localStorage);

}


//updateTable(data) gets passed 'data' and updates the table.
function updateTable(data,selectedOptions){

    //data is the master block that contains the entire entrylist, in this case, its localStorage

    //guaranteed to be from local storage now

    //turn localstorage into an array so i can call 'reverse()' on it
    //kludge! :)
    var entryArray=[];

    //push each into the array in whatever order $.each does
    $.each(data,function(indexInArray,valueOfElement){
        entryArray.push(valueOfElement);
    });
    //sort by timestamp
    entryArray.sort(function(a,b){
//        console.log("sorting a"+a+" b"+b+"\nAnswer: "+(JSON.parse(a).timeStamp > JSON.parse(b).timeStamp));
        return JSON.parse(a).timeStamp < JSON.parse(b).timeStamp ? 1 : -1;
    });

    //its an array! so reverse it [update: no longer valid becuase i reverse > to < in sort function :) ]
//    if(entryArray instanceof Array)
  //      entryArray.reverse();


    // Empty content string
    var tableContent = '';

    //show in reverse order so newest at top, sorts by mongo id NOT by date...
    /* this doesnt work because isArray is undefined because itsa jQuery object! need to use 'entryArray instanceof Array'
    if(entryArray.isArray){
        entryArray = entryArray.reverse();
        console.log("its an array");
    }else{
     console.log("not an array");
    }
*/
    // For each item in our JSON data, add a table row and cells to the content string
    $.each(entryArray, function(indexInArray, valueOfElement){

        //this turns the stringified webstorage into a real object
        //        var entry = JSON.parse(valueOfElement);
        var entry;

        //if from local, we get strings
        if(typeof valueOfElement === 'string')
            entry = JSON.parse(valueOfElement);
        else if(typeof valueOfElement === 'object')
            entry = valueOfElement;//if from mongo, we get objects
        else{
            console.log('Skipping entry Index: "'+indexInArray+'" of type:"'+typeof valueOfElement+'" because it is not an object or string');
            return false; //its something else i cant handle so bail
        }
        //        console.log("iia "+indexInArray+"  voe "+valueOfElement+" entry "+entry);

        //convert the ISO stamp to a readable string, create it if it timeStamp doesnt exist.
        var entryDate;
        if(entry.timeStamp)
            entryDate = new Date(entry.timeStamp);
        else
            entryDate = new Date();
        //trim leading and trailing whitespace so that 'I ' is the same as 'I'
        if(entry.nouns)
            entry.nouns = entry.nouns.trim();
        else
            console.log("choked on "+entry.timeStamp);
        if(entry.verbs)
            entry.verbs = entry.verbs.trim();
        if(entry.adjectives)
            entry.adjectives = entry.adjectives.trim();

        //if a doc has an id, its been saved to mongo
        var saved = '';
        if(!entry._id)
            saved='*';//if not then its local so note it with a *

        //build the table
        /****old way witih one col per element
        tableContent += '<tr>';
        tableContent += '<td class="timestamp" title="'+entryDate+'">'+entryDate.toLocaleDateString()+'</td>';
        tableContent += '<td class="nouns">' + entry.nouns + '</td>';
        tableContent += '<td class="verbs">' + entry.verbs + '</td>';
        tableContent += '<td class="adjectives">' + entry.adjectives+ '</td>';
        tableContent += '<td><a href="#" class="linkdeleteentry" rel="' + entry._id + '" indexinarray="'+indexInArray+'">'+saved+'delete</a></td>'
        tableContent += '</tr>';
    **** end old way****/

        /*****better way with all text in one td
    tableContent += '<tr>';
        tableContent += '<td class="entry">' + entry.nouns+' '+entry.verbs+' '+entry.adjectives+saved+'</td>';
        tableContent += '<td class="timestamp" title="'+entryDate+'">'+entryDate.toLocaleDateString()+'</td>';
        tableContent += '<td><a href="#" class="linkdeleteentry" rel="' + entry._id + '" indexinarray="'+indexInArray+'">delete</a></td>'
        tableContent += '</tr>';
    ****/

        //best way with out using a table!
        //        tableContent += '<hr>' + entry.nouns+' '+entry.verbs+' '+entry.adjectives+saved;
        tableContent += '<hr/><span style="text-align:left;">'+entry.nouns+' '+entry.verbs+' '+entry.adjectives+saved+'</span>';
        tableContent += '<span style="float:right;" title="'+entry.timeStamp+'">';
        tableContent += '<a href="#" class="linkdeleteentry" rel="' + entry._id + '" indexinarray="'+entry.timeStamp+'">delete</a> ';
        tableContent += (entryDate.getMonth()+1)+'/'+entryDate.getDate()+'/'+entryDate.getFullYear()+' '+entryDate.getHours() + ":";
        //add leading zero to minutes, lame hack grumble
        var m = entryDate.getMinutes();
        var paddedM = m<10 ? '0'+m : m;
        tableContent += paddedM+'</span>';



    });//end $.each


    // Inject the whole content string into our existing HTML table
    //table$('#userList table tbody').html(tableContent);
    $('#userList').html(tableContent);

}


//populateTable() gets the json and updatesTable(data)
function populateTable() {

    //debug only!
    if(false)
    {
        console.log("clearing local storage and downloading new entrylist");
        localStorage.clear();
    }
    // jQuery AJAX call for JSON
    if(true){
        var hasUnsavedLocalChanges = false;
        /**** changed so it doesnt overwrite local so no need to block here
        //check for unsaved local changes first
        $.each(localStorage,function(indexInArray, valueOfElement){
            //turn local string into object
            var k;
            if(valueOfElement){
                k= JSON.parse(valueOfElement);
                if(!k._id){
                    hasUnsavedLocalChanges = true;
                    console.log("found unsaved local aborting json fetch "+indexInArray+JSON.stringify(k));
                }
            }
        });
    ***/
        if(!hasUnsavedLocalChanges)
        {
            console.log("no unsaved changes, getting new data");
            $.getJSON( 'http://icefishing.dyndns.org:8080/entrylist?user='+username, function(data){
                //json from mongo returns an array of objects, no need to JSON.parse

                //get the latest and convert it to localStorage
                //now updateTable only ever reads from localStorage
                $.each(data,function(indexInArray,valueOfElement){
                    //this will overwrite existing local items
                    //if the value has a time stamp, use the timestamp as the localStorage key
                    //else, use the index value as the key
                    //This is just error detection because all entries from server should have a timestamp
                    var localIndex;
                    if(valueOfElement.timeStamp){
                        localIndex = valueOfElement.timeStamp;
                        //console.log("working with "+' local index '+localIndex+' voe '+JSON.stringify(valueOfElement)+' lcoal '+localStorage[localIndex]);

                        //check if we already have local copy of the data
                        if(  !localStorage[localIndex]   ){
                            //no local copy, so create it
                            localStorage[localIndex] = JSON.stringify(valueOfElement);
                            //console.log("creating local copy "+localIndex);
                        }else{
                            //console.log("skipping existing local "+localStorage[localIndex]);
                        }
                    }
                    else{
                        localStorage[indexInArray] = JSON.stringify(valueOfElement);
                    }

                });
                //update table and run metrics in the call back because getJSON is asynchronous
                //and this has to happen AFTER the localStorage is all set up.
                runMetrics();
                updateTable(localStorage);
                document.getElementById("statusSpan").innerHTML = "Pull complete.";
            }).fail(function(){
            document.getElementById("statusSpan").innerHTML = "Pull failed! Couldn't connect to server. Running locally.";
				//this is $.getJSON().fail() using jquery promises. I guess. 
				//So if the GET fails, we just load from local. 
				console.log("getJSON failed! Updating locally.");
				updateTable(localStorage);
			});
        }
    }else{
        console.log("keeping existing storage");
        //we should already have local data, so update the table
        updateTable(localStorage);
    }

    /*
    //WEBSTORAGE!
    //console.log("index " + indexInArray + " value "+valueOfElement);
    //$.each(valueOfElement,function(ii, ve){
    //    console.log("sub  index " + ii + " sub value "+ve);
    // });

    //    localStorage[indexInArray] = JSON.stringify(valueOfElement);
    //WEBSTORAGE
    //    var kk = localStorage.key(30);
    //    localStorage[1] = "cowboy";
    //    console.log("50th "+localStorage[1] + " length "+localStorage.length);


    updateTable(data);
} );*/

};


// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

};

function addBatchUser(event)
{
    event.preventDefault();
    huge = [

            ];

    for(var k = 0 ; k<huge.length ; k++){
        console.log("Batch:"+k+" : "+huge[k].username);
        // Use AJAX to post the object to our adduser service
        $.ajax({
                   type: 'POST',
                   data: huge[k],
                   url: 'http://icefishing.dyndns.org:8080/adduser',
                   dataType: 'JSON'
               }).done(function( response ) {

                   // Check for successful (blank) response
                   if (response.msg === '') {

                       // Update the table
                       populateTable();
                   }
                   else {

                       // If something goes wrong, alert the error message that our service returned
                       alert('Error: ' + response.msg);

                   }
               });//end .done({});
    }//end for(){}
}//end addBatchUser(){}

// Add User
function addUser(event) {
    event.preventDefault();

    console.log("addUser from global.js"+
                "global.js gets embedded into each web page and runs IN the browser.");

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    //$().val() is a jQuery built in validator
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser   input#inputUserName').val(),
            'email': $('#addUser   input#inputUserEmail').val(),
            'fullname': $('#addUser   input#inputUserFullname').val(),
            'age': $('#addUser   input#inputUserAge').val(),
            'location': $('#addUser   input#inputUserLocation').val(),
            'gender': $('#addUser   input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
                   type: 'POST',
                   data: newUser,
                   url: 'http://icefishing.dyndns.org:8080/adduser',
                   dataType: 'JSON'
               }).done(function( response ) {

                   // Check for successful (blank) response
                   if (response.msg === '') {

                       // Clear the form inputs
                       $('#addUser   input').val('');

                       // Update the table
                       populateTable();

                   }
                   else {

                       // If something goes wrong, alert the error message that our service returned
                       alert('Error: ' + response.msg);

                   }
               });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete Entry
function deleteEntry(event) {

    event.preventDefault();

    // No confirmation dialog
    var confirmation = confirm('Are you sure you want to delete entry? ');

    //confirmation = true;
    // Check and make sure the user confirmed
    if (confirmation === true) {

        //Identify local copy, will eventually delete from local storage (index is timestamp)
        var localIndex = $(this).attr('indexinarray');

        //Delete from mongo
        $.ajax({
                   type: 'DELETE',
                   url: 'http://icefishing.dyndns.org:8080/deleteentry/' + $(this).attr('rel'),
                   //handle AJAX error
                   error: function(jqXHR,textStatus,errorThrown){
                       var conf = confirm('Error communicating with server. Do you want to delete locally? If entry exists on server, it will come back when entries are pulled from server.\nServer says: "'+textStatus+'"');
                       //TODO: This should actually 'mark the entry for deletion' and then delete it later using sync. But for now, its good enough.
                       if(conf === true){
                           if(localIndex){
                               localStorage.removeItem(localIndex);
                           }else{
                               console.log("Error! Couldnt delete from localStorage, index: "+localIndex);
                           }
                           //since its already deleted from local, we can just run locally
                           updateTable(localStorage);
                       }
                   }
               }).done(function( response ) {
                   //This means jQuery ajax completed succesfully, so any errors are on server side.
                   // Check for a successful (blank) response
                   if (response.msg === '') {
                       //successfully deleted from server, so delete locally
                       if(localIndex){
                           //localStorage.splice(localIndex,1);
                           localStorage.removeItem(localIndex);
                           document.getElementById("statusSpan").innerHTML = "Delete local complete.";
                       }else{
                           console.log("Error! Couldnt delete from localStorage, index: "+localIndex);
                       }
                       //update the table which will delete the row
                       //since its already deleted from local, we can just run locally
                       updateTable(localStorage);
                   }
                   else {
                       //failed to delete on server, so maybe we should keep local copy?
                       var conf = confirm('Error - could not delete from server, do you want to delete locally?\nServer said: '+response.msg);
                       if(conf === true){
                           if(localIndex){
                               localStorage.removeItem(localIndex);
                               document.getElementById("statusSpan").innerHTML = "Delete local complete.";
                           }else{
                               console.log("Error! Couldnt delete from localStorage, index: "+localIndex);
                           }
                           //since its already deleted from local, we can just run locally
                           updateTable(localStorage);
                       }
                   }
               });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }
};



// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
                   type: 'DELETE',
                   url: 'http://icefishing.dyndns.org:8080/deleteuser/' + $(this).attr('rel')
               }).done(function( response ) {

                   // Check for a successful (blank) response
                   if (response.msg === '') {
                   }
                   else {
                       alert('Error: ' + response.msg);
                   }

                   // Update the table
                   populateTable();

               });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};
//new

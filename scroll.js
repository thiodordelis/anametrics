/**
 * Scroll detect
 * 24.06.2018
 */
"use strict";
let old = 0;
let nes = 0;
let isScrolling;

function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    )
}

/**
 * Function to calculate the amount scroll (in %) that was made by the visitor
 * You can POST the scroll amount(nes) using AJAX or some other technique that suits you best.
 *  
 * @param none
 * @returns none
 */
function amountscrolled(){
    var winheight= window.innerHeight || (document.documentElement || document.body).clientHeight
    var docheight = getDocHeight()
    var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
    var trackLength = docheight - winheight
    var pctScrolled = Math.floor(scrollTop/trackLength * 10)
    old = pctScrolled;
    if(old>nes) {
        nes=old;
        //Change this with your API
        $.ajax({
            method: "POST",
            crossDomain: true,
            url: "/api/scroll",
            data: { uid: '123', scroll: nes, hostnm: document.location.hostname },
            
        })
        .done(function( msg ) {
        });

    }
}

// Listen for scroll events. We are using a timeout function for avoid 'fast' scrolls and DDoS your own server 
window.addEventListener('scroll', function ( event ) {

	// Clear our timeout throughout the scroll
	window.clearTimeout( isScrolling );

	// Set a timeout to run after scrolling ends
	isScrolling = setTimeout(function() {
        amountscrolled();
	}, 100);

}, true);

$(function() {
    
    /**
     * On page load, calculate and send client-side metrics, such as user time, DNS time and First Paint time
     */
    window.addEventListener("load", function() {
        setTimeout(function() {
            var firstPaint = 0;
            var firstMeanPaint = 0;
            
            let performance = window.performance;
            var timing = window.performance.timing;
            var navigation = window.performance.navigation;

            var userTime = timing.loadEventEnd - timing.navigationStart;
            var dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
            var connectionTime = timing.connectEnd - timing.connectStart;
            var requestTime = timing.responseEnd - timing.requestStart;
            var fetchTime = timing.responseEnd - timing.fetchStart;
            var navType = navigation.type;
            var redirectCount = navigation.redirectCount;
            var domLoaded = timing.domContentLoadedEventEnd- timing.navigationStart;
            
            let performanceEntries = performance.getEntriesByType('paint');
            try {
                firstPaint = performanceEntries[0].startTime;
                firstMeanPaint = performanceEntries[1].startTime          
            }
            catch(error) {
            }

            //Change this with your API
            $.ajax({
                method: "POST",
                crossDomain: true,
                url: "/api/metrics",
                data: { uid: '123', dom_ready: domLoaded, user_time: userTime, dns: dnsTime, connection: connectionTime, request_time: requestTime, fetch_time: fetchTime, nav_type:navType, redirect_count: redirectCount, first_paint: Math.floor(firstPaint), first_contentful_paint: Math.floor(firstMeanPaint), hostnm: document.location.hostname  }
            })
            .done(function( msg ) {
            });

        }, 0);
    }, false);
});



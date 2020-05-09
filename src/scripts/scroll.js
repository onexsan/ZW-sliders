const sections = $('.section');
const display = $('.maincontent');
let inscroll = false;

const md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile();

const switchActiveClassSideMenu = menuItemIndex => {
  $('.nav-rt__item')
  .eq(menuItemIndex)
  .addClass('active')
  .siblings()
  .removeClass("active");

}

const performTransition = sectionEq => {

  if(inscroll) return;

    inscroll = true;
    const position = `${sectionEq * -100}%`;
  
    sections
      .eq(sectionEq)
      .addClass("active")
      .siblings()
      .removeClass("active");
  
    display.css({
      transform: `translateY(${position})`
    })


    // 1000мс переключение секции, 300мс энерция 
    setTimeout( () => {
      switchActiveClassSideMenu(sectionEq);
      inscroll = false;
    }, 1000 + 300)

 
}

scrollToSection = direction => {
  const activeSection = sections.filter('.active');
  const nextSection = activeSection.next();
  const prevSection = activeSection.prev();

  if (direction === "next" && nextSection.length) {
    performTransition(nextSection.index());
  }

  if (direction === "prev" && prevSection.length) {
    performTransition(prevSection.index());
  }

}

$('.wrapper').on('wheel', e => {
  const deltaY = e.originalEvent.deltaY;
  console.log('weel event');

  //next
  if(deltaY > 0) {
    scrollToSection("next");
  }


  //prev  
  if(deltaY < 0) {
    scrollToSection("prev");
  }

});

$('.wrapper').on('touchMove', e => {
  e.preventDefault();
})

$(document).on("keydown", e => {
  //console.log(e.keyCode);
  switch(e.keyCode) {
    case 40:
      scrollToSection("next");
      break;

    case 38: 
      scrollToSection("prev");
      break;
  }
})

$("[data-scroll-to]").on('click', e => {
  e.preventDefault();

  const target = $(e.currentTarget).attr('data-scroll-to');
  //console.log(target);

  performTransition(target);
})

if (isMobile) {
  $(window).swipe({
    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
      $(this).text("You swiped " + direction );  
      const nextOrPrev = direction === "up" ? "next" : "prev"
      scrollToSection(nextOrPrev);
    }
  });
}


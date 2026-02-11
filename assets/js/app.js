var MyScroll = "";
(function (window, document, $, undefined) {
  "use strict";
  var isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Nokia|Opera Mini/i.test(
      navigator.userAgent
    )
      ? !0
      : !1;
  var Scrollbar = window.Scrollbar;
  var Init = {
    i: function (e) {
      Init.s();
      Init.methods();
    },
    s: function (e) {
      (this._window = $(window)),
        (this._document = $(document)),
        (this._body = $("body")),
        (this._html = $("html"));
    },
    methods: function (e) {
      Init.w();
      Init.BackToTop();
      Init.preloader();
      Init.header();
      Init.dropdown();
      Init.faq();
      Init.cryptoChart();
      Init.slick();
      Init.categoryToggle();
      Init.formValidation();
      Init.contactForm();
    },
    w: function (e) {
      if (isMobile) {
        $("body").addClass("is-mobile");
      }
    },
    BackToTop: function () {
      var scrollToTopBtn = document.querySelector(".scrollToTopBtn");
      var rootElement = document.documentElement;
      function handleScroll() {
        var scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
        if (rootElement.scrollTop / scrollTotal > 0.05) {
          scrollToTopBtn.classList.add("showBtn");
        } else {
          scrollToTopBtn.classList.remove("showBtn");
        }
      }
      function scrollToTop() {
        rootElement.scrollTo({ top: 0, behavior: "smooth" });
      }
      scrollToTopBtn.addEventListener("click", scrollToTop);
      document.addEventListener("scroll", handleScroll);
    },
    preloader: function () {
      setTimeout(function () {
        $("#preloader").fadeOut("slow");
      }, 3800);
    },
    header: function () {
      function dynamicCurrentMenuClass(selector) {
        let FileName = window.location.href.split("/").reverse()[0];
        selector.find("li").each(function () {
          let anchor = $(this).find("a");
          if ($(anchor).attr("href") == FileName) {
            $(this).addClass("current");
          }
        });
        selector.children("li").each(function () {
          if ($(this).find(".current").length) {
            $(this).addClass("current");
          }
        });
        if ("" == FileName) {
          selector.find("li").eq(0).addClass("current");
        }
      }
      if ($(".main-menu__list").length) {
        let mainNavUL = $(".main-menu__list");
        dynamicCurrentMenuClass(mainNavUL);
      }
      if ($(".main-menu__nav").length && $(".mobile-nav__container").length) {
        let navContent = document.querySelector(".main-menu__nav").innerHTML;
        let mobileNavContainer = document.querySelector(
          ".mobile-nav__container"
        );
        mobileNavContainer.innerHTML = navContent;
      }
      if ($(".sticky-header__content").length) {
        let navContent = document.querySelector(".main-menu").innerHTML;
        let mobileNavContainer = document.querySelector(
          ".sticky-header__content"
        );
        mobileNavContainer.innerHTML = navContent;
      }
      if ($(".mobile-nav__container .main-menu__list").length) {
        let dropdownAnchor = $(
          ".mobile-nav__container .main-menu__list .dropdown > a"
        );
        dropdownAnchor.each(function () {
          let self = $(this);
          let toggleBtn = document.createElement("BUTTON");
          toggleBtn.setAttribute("aria-label", "dropdown toggler");
          toggleBtn.innerHTML = "<i class='fa fa-angle-down'></i>";
          self.append(function () {
            return toggleBtn;
          });
          self.find("button").on("click", function (e) {
            e.preventDefault();
            let self = $(this);
            self.toggleClass("expanded");
            self.parent().toggleClass("expanded");
            self.parent().parent().children("ul").slideToggle();
          });
        });
      }
      if ($(".mobile-nav__toggler").length) {
        $(".mobile-nav__toggler").on("click", function (e) {
          e.preventDefault();
          $(".mobile-nav__wrapper").toggleClass("expanded");
          $("body").toggleClass("locked");
        });
      }
      $(window).on("scroll", function () {
        if ($(".stricked-menu").length) {
          var headerScrollPos = 130;
          var stricky = $(".stricked-menu");
          if ($(window).scrollTop() > headerScrollPos) {
            stricky.addClass("stricky-fixed");
          } else if ($(this).scrollTop() <= headerScrollPos) {
            stricky.removeClass("stricky-fixed");
          }
        }
      });
    },

    dropdown: function () {
      const selectedAll = document.querySelectorAll(".wrapper-dropdown");
      selectedAll.forEach((selected) => {
        const optionsContainer = selected.children[2];
        const optionsList = selected.querySelectorAll(
          "div.wrapper-dropdown li"
        );

        selected.addEventListener("click", () => {
          let arrow = selected.children[1];

          if (selected.classList.contains("active")) {
            handleDropdown(selected, arrow, false);
          } else {
            let currentActive = document.querySelector(
              ".wrapper-dropdown.active"
            );

            if (currentActive) {
              let anotherArrow = currentActive.children[1];
              handleDropdown(currentActive, anotherArrow, false);
            }

            handleDropdown(selected, arrow, true);
          }
        });

        for (let o of optionsList) {
          o.addEventListener("click", () => {
            selected.querySelector(".selected-display").innerHTML = o.innerHTML;
          });
        }
      });

      window.addEventListener("click", function (e) {
        if (e.target.closest(".wrapper-dropdown") === null) {
          closeAllDropdowns();
        }
      });

      function closeAllDropdowns() {
        const selectedAll = document.querySelectorAll(".wrapper-dropdown");
        selectedAll.forEach((selected) => {
          const optionsContainer = selected.children[2];
          let arrow = selected.children[1];

          handleDropdown(selected, arrow, false);
        });
      }

      // open all the dropdowns
      function handleDropdown(dropdown, arrow, open) {
        if (open) {
          arrow.classList.add("rotated");
          dropdown.classList.add("active");
        } else {
          arrow.classList.remove("rotated");
          dropdown.classList.remove("active");
        }
      }
    },
    slick: function () {
      if ($(".brand-slider").length) {
        $(".brand-slider").slick({
          slidesToShow: 5,
          slidesToScroll: 1,
          autoplay: true,
          centerMode: !0,
          autoplaySpeed: true,
          speed: 8000,
          cssEase: "linear",
          infinite: !0,
          arrows: !1,
          touchMove: !0,
          swipeToSlide: !0,
          swipe: !0,
          responsive: [
            {
              breakpoint: 1099,
              settings: { slidesToShow: 4 },
            },
            {
              breakpoint: 899,
              settings: { slidesToShow: 3 },
            },
            {
              breakpoint: 769,
              settings: { slidesToShow: 3 },
            },
            {
              breakpoint: 576,
              settings: { slidesToShow: 2 },
            },
          ],
        });
      }
      if ($(".blockchain-slider").length) {
        $(".blockchain-slider").slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          autoplay: true,
          dots: false,
          fade: true,
          draggable: true,
          arrows: false,
          lazyLoad: "progressive",
          speed: 800,
          autoplaySpeed: 2000,
          responsive: [
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 1,
              },
            },
          ],
        });
      }
      if ($(".testimonials-slider").length) {
        $(".testimonials-slider").slick({
          variableWidth: true,
          centerMode: true,
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: !0,
          autoplay: true,
          dots: true,
          draggable: !0,
          arrows: !1,
          lazyLoad: "progressive",
          speed: 800,
          autoplaySpeed: 2000,
          responsive: [
            {
              breakpoint: 1099,
              settings: { slidesToShow: 4 },
            },
            {
              breakpoint: 576,
              variableWidth: false,
              centerMode: false,
              settings: { slidesToShow: 1 },
            },
          ],
        });
      }
      if ($(".player-card-slider").length) {
        $(".player-card-slider").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: !0,
          autoplay: !1,
          dots: !0,
          draggable: !0,
          arrows: !1,
          lazyLoad: "progressive",
          speed: 500,
          autoplaySpeed: 2000,
          responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } },
          ],
        });
      }

      $(function () {
        // Vertical slider
        var verticalSlider = $(".currency-slider");
        verticalSlider.slick({
          speed: 500,
          autoplaySpeed: 2000,
          arrows: false,
          autoplay: true,
          centerMode: false,
          infinite: true,
          rows: 0,
          slidesToShow: 4,
          slidesToScroll: 1,
          vertical: true,
          verticalSwiping: true,
        });

        verticalSlider.on(
          "beforeChange",
          function (event, slick, currentSlide, nextSlide) {
            var direction,
              slideCountZeroBased = slick.slideCount - 1;

            if (nextSlide == currentSlide) {
              direction = "same";
            } else if (Math.abs(nextSlide - currentSlide) == 1) {
              // 1 or -1
              if (slideCountZeroBased === 1) {
                // If there's only two slides
                direction = "duo";
              } else {
                // More than two slides
                direction = nextSlide - currentSlide > 0 ? "right" : "left";
              }
            } else {
              // e.g., slide 0 to slide 6
              direction = nextSlide - currentSlide > 0 ? "left" : "right";
            }

            if (direction == "duo") {
              $(
                '.slick-cloned[data-slick-index="' +
                  (nextSlide + slideCountZeroBased + 1) +
                  '"]',
                sliders
              ).addClass("slick-current-clone-animate");

              $(
                '.slick-cloned[data-slick-index="' +
                  (nextSlide - slideCountZeroBased - 1) +
                  '"]',
                sliders
              ).addClass("slick-current-clone-animate");
            }

            if (direction == "right") {
              $(
                '.slick-cloned[data-slick-index="' +
                  (nextSlide + slideCountZeroBased + 1) +
                  '"]',
                verticalSlider
              ).addClass("slick-current-clone-animate");
            }

            if (direction == "left") {
              $(
                '.slick-cloned[data-slick-index="' +
                  (nextSlide - slideCountZeroBased - 1) +
                  '"]',
                verticalSlider
              ).addClass("slick-current-clone-animate");
            }
          }
        );

        verticalSlider.on(
          "afterChange",
          function (event, slick, currentSlide, nextSlide) {
            $(".slick-current-clone-animate", verticalSlider).removeClass(
              "slick-current-clone-animate"
            );
            $(".slick-current-clone-animate", verticalSlider).removeClass(
              "slick-current-clone-animate"
            );
          }
        );
      });

      $(".btn-prev").click(function () {
        var $this = $(this).attr("data-slide");
        $("." + $this).slick("slickPrev");
      });
      $(".btn-next").click(function () {
        var $this = $(this).attr("data-slide");
        $("." + $this).slick("slickNext");
      });
    },
    cryptoChart: function () {
      if ($(".market-page").length) {
        const ctx = document.getElementById("btcChart").getContext("2d");
        const btcChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [
              {
                label: "BTC/USD",
                data: [18518.55, 20500, 19500, 21000, 18518.55, 22500, 23000],
                borderColor: "#00ff5f",
                borderWidth: 2,
                fill: false,
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                ticks: {
                  color: "#fff",
                },
                grid: {
                  color: "#333",
                },
              },
              y: {
                ticks: {
                  color: "#fff",
                },
                grid: {
                  color: "#333",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    },
    faq: function () {
      if ($(".faq-block").length) {
        $(".accordion-button").on("click", function () {
          $(".faq-block").removeClass("active");
          $(this).parents(".faq-block").toggleClass("active");
        });
      }
    },
    categoryToggle: function () {
      if ($(".flip-card").length) {
        $(".flipButton").addClass("active");

        $(".flipButton").on("click", function () {
          $("#card").removeClass("flipped");
          $(".flipButton").addClass("active");
          $(".flipButtonBack").removeClass("active"); 
        });

        $(".flipButtonBack").on("click", function () {
          $("#card").addClass("flipped");
          $(".flipButtonBack").addClass("active"); 
          $(".flipButton").removeClass("active"); 
        });
      }
    },
    formValidation: function () {
      if ($(".contact-form").length) {
        $(".contact-form").validate();
      }
    },
        contactForm: function () {
      $(".contact-form").on("submit", function (e) {
        e.preventDefault();
        if ($(".contact-form").valid()) {
          var _self = $(this);
          _self
            .closest("div")
            .find('button[type="submit"]')
            .attr("disabled", "disabled");
          var data = $(this).serialize();
          $.ajax({
          url: "./assets/mail/contact.php",
            type: "post",
            dataType: "json",
            data: data,
            success: function (data) {
              $(".contact-form").trigger("reset");
              _self.find('button[type="submit"]').removeAttr("disabled");
              if (data.success) {
                document.getElementById("message").innerHTML =
                  "<h3 class='bg-primary text-white p-3 mt-3 rounded'>Email Sent Successfully</h3>";
              } else {
                document.getElementById("message").innerHTML =
                  "<h3 class='bg-primary text-white p-3 mt-3 rounded'>There is an error</h3>";
              }
              $("#message").show("slow");
              $("#message").slideDown("slow");
              setTimeout(function () {
                $("#message").slideUp("hide");
                $("#message").hide("slow");
              }, 3000);
            },
          });
        } else {
          return !1;
        }
      });
    },
  };
  Init.i();
})(window, document, jQuery);

document.addEventListener("DOMContentLoaded", function() {
    // ၁။ လက်ရှိရောက်နေတဲ့ Page နာမည်ကို ယူမယ်
    const path = window.location.pathname;
    const page = path.split("/").pop(); // ဥပမာ - index.html

    // ၂။ Page နဲ့ Icon နာမည် တွဲမယ်
    let currentIcon = "";

    if (page === "" || page === "index.html") {
        currentIcon = "home";
    } else if (page === "about.html") {
        currentIcon = "assets";
    } else if (page === "market.html") {
        currentIcon = "trade";
    } else if (page === "contact.html") {
        currentIcon = "service";
    } else if (path.includes("profile.html")) {
        currentIcon = "profile";
    }

    // ၃။ Active ဖြစ်တဲ့ကောင်ကို Icon လဲမယ်
    if (currentIcon) {
        // Text အရောင်ပြောင်းဖို့ Class ထည့်မယ်
        const linkElement = document.getElementById('link-' + currentIcon);
        if (linkElement) {
            linkElement.classList.add('active');
        }
        
        // Image ကို -active.svg နဲ့ လဲလိုက်မယ်
        const imgElement = document.getElementById('icon-' + currentIcon);
        if (imgElement) {
            imgElement.src = `assets/media/nav-icons/${currentIcon}-active.svg`;
        }
    }
});
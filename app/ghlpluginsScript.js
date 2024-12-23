var conversations_loaded = false;
var location_id = window.location.href.split("/")[5];
var base_url_customization = "http://localhost:8000";
// var base_url_customization = "https://commsmessenger.com";
// var base_url_customization = "https://beta.ghlplugins.com";
let main_secrete_key_customization = null;
let access_token = null;
var events_loaded_customization = false;
let configuration_restricted = false;
var location_changed_customization = false;
var ghl_customization_dashboard_observer = null;
let isV1 = null;
let ghl_customization_service = null;
let total_unread_conversations = 0;
let ghl_configuration_customization;
let ghl_customization_navItem;
let ghl_customization_sidebarItem;
let customElement;
let ghl_graphcolor;
var routeChangeEvent_customization = {
  detail: {
    to: document.getElementById("app").__vue__.$router.matcher.match(window.location.pathname),
    from: { name: "settings-v2" },
  },
};
const limit_try_customization = 30;

function setupCustomizationGHLChangeEvents() {
  events_loaded_customization = true;
  window.addEventListener("routeChangeEvent", function (eev) {
    location_id = eev.detail.to.params.location_id;

    routeChangeEvent_customization = eev;
    if (ghl_customization_service?.conversations_count && access_token) {
      handleConversations();
    }

    if (ghl_configuration_customization) {
      if (
        routeChangeEvent_customization?.detail?.from?.name?.includes("settings") &&
        !routeChangeEvent_customization?.detail?.to?.name?.includes("settings")
      ) {
        handleGhlSideBar();
      }
      if (!!!routeChangeEvent_customization.detail.from.params.location_id) {
        handleGhlSideBar();
        handleGhlNavbar();
      }

      if (!!!routeChangeEvent_customization.detail.to.params.location_id) {
        if (ghl_customization_dashboard_observer)
          ghl_customization_dashboard_observer.disconnect();
      }
      if (routeChangeEvent_customization.detail.to.name === "dashboard-v2") {
        handleGhlgraph();
        console.log("Setting");
      }
    }
  });

  window.addEventListener("locationChangeEvent", function (evv) {
    console.log("..... => ", evv);
    conversations_loaded = false;
    location_changed_customization = true;
    location_id = evv.detail.to;

    if (ghl_customization_service?.conversations_count && access_token) {
      document
        .getElementById("sb_conversations")
        .setAttribute("data-unreads", "-");
      setConversionCss();
    }

    access_token = null;
    isV1 = null;
    ghl_customization_service = null;

    init_main_customization();
  });
}

function handleLogo(remove = false) {
  let tried = 0;
  const intcheck = setInterval(() => {
    tried++;
    if (document.querySelector("#sidebar-v2 .agency-logo-container")) {
      clearInterval(intcheck);
      document.querySelector("#sidebar-v2 .agency-logo-container").innerHTML =
        "";

      const loader_container = document.createElement("div");
      loader_container.classList.add("loader");

      const img_container = document.createElement("img");
      img_container.classList.add("object-contain");
      img_container.classList.add("agency-logo");
      img_container.style.maxWidth = "80%";
      img_container.style.height = "auto";

      img_container.addEventListener("load", () => {
        document
          .querySelector("#sidebar-v2 .agency-logo-container .loader")
          ?.remove();
        // document.body.appendChild(element);
      });

      img_container.src = remove
        ? document.getElementById("app").__vue__.$store.getters["company/get"]
            .logo_url
        : ghl_customization_service.logo;

      document
        .querySelector("#sidebar-v2 .agency-logo-container")
        .appendChild(loader_container);
      document
        .querySelector("#sidebar-v2 .agency-logo-container")
        .appendChild(img_container);
    }
    if (tried >= limit_try_customization) {
      console.log("not found found");
      clearInterval(intcheck);
    }
  }, 500);
}

function setConversionCss(bg_color, bg_image, color) {
  // Set the CSS styles
  // console.log("=-------------- ", access_token, bg_color, bg_image, color);
  if (document.getElementById("conversation_custom_css"))
    document.getElementById("conversation_custom_css").remove();

  var styleElement = document.createElement("style");

  var cssStyles = `
     #sb_conversations:after {
        content: attr(data-unreads);
       margin-left: auto;
       width: 25px !important;
       height:  25px !important;
       text-align: center!important;
     border: 2px solid #fff0 !important;
     border-radius: 25px !important;
   color: white !important;
       background-color: red !important;
   }

     `;
  //  color: ${bg_color ?? bg_image ?? "transparent"} !important;
  //  background-color: ${color ?? "transparent"} !important;

  styleElement.innerHTML = cssStyles;
  styleElement.id = "conversation_custom_css";
  document.head.appendChild(styleElement);
}

function applyConversionCount() {
  let tried = 0;
  const intcheck = setInterval(() => {
    tried++;
    if (document.getElementById("sb_conversations")) {
      clearInterval(intcheck);

      document
        .getElementById("sb_conversations")
        .setAttribute(
          "data-unreads",
          total_unread_conversations > 999 ? `999+` : total_unread_conversations
        );
      const { backgroundColor, backgroundImage, color } =
        window.getComputedStyle(document.getElementById("sidebar-v2"));

      setConversionCss(backgroundColor, backgroundImage, color);
    }
    if (tried >= limit_try_customization) {
      console.log("not found found");
      clearInterval(intcheck);
    }
  }, 500);
}

function reloadNavAndSidebarItems() {
  const backup = JSON.parse(
    JSON.stringify(
      document.getElementById("app").__vue__.$children[14].$children[0]
        .$children[4].$props.navigation
    )
  );
  document.getElementById(
    "app"
  ).__vue__.$children[14].$children[0].$children[4].$props.navigation = [];
  setTimeout(() => {
    document.getElementById(
      "app"
    ).__vue__.$children[14].$children[0].$children[4].$props.navigation =
      backup;
  }, 1000);

  document
    .querySelectorAll(
      ".container-fluid > .hl_header--controls [data-customization]"
    )
    .forEach((el) => {
      el.remove();
    });
}

function handleConversations() {
  if (conversations_loaded) {
    if (
      routeChangeEvent_customization?.detail?.from?.name?.includes("settings-v2")
    ) {
      applyConversionCount();
    }
  } else {
    const headers = new Headers({
      Authorization: "Bearer " + access_token,
      Version: "2021-07-28",
      "Content-Type": "application/json",
    });

    setConversionCss();

    fetch(
      `https://services.leadconnectorhq.com/conversations/search?locationId=${location_id}&status=unread`,
      {
        method: "GET",
        headers: headers,
      }
    )
      .then(async (res) => {
        // console.log(res);
        if (!res || !res.ok) throw new Error("Something went wrong");
        const { total, ...rest } = await res.json();

        total_unread_conversations = total;
        applyConversionCount();
        conversations_loaded = true;
      })
      .catch((err) => {
        console.log("failed ,", err);
      });
  }
}

function init_main_customization() {
  fetch(
    `${base_url_customization}/extern/ghl_customization/details/${location_id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        zYpSvEr: zYpSvEr.uuid,
      },
    }
  )
    .then(async (res) => {
      // console.log(res);
      if (!res || !res.ok) throw new Error("Something went wrong");
      const {
        nTc0uA7,
        success,
        secret,
        v1sI_,
        qn2s7tI,
        logo,
        restricted,
        configuration,
      } = await res.json();
      if (success) {
        main_secrete_key_customization = secret;

        if (restricted) {
          console.log("inn restricted ", restricted);

          if (location_changed_customization) {
            if (!configuration_restricted) {
              // console.log(
              //   "inn !configuration_restricted ",
              //   !configuration_restricted
              // );
              reloadNavAndSidebarItems();
            }
          }
        } else if (configuration) {
          ghl_graphcolor = configuration?.theme_code
            ? configuration?.theme_code["--chart-color"]?.value
            : null;
          ghl_customization_navItem = configuration.nav_items;
          ghl_customization_sidebarItem = configuration.main_sidebar;
          handleGhlSideBar();
          handleGhlNavbar();

          if (
            routeChangeEvent_customization.detail.to.name === "dashboard-v2"
          ) {
            handleGhlgraph();
          }
        }

        ghl_configuration_customization = configuration;

        configuration_restricted = restricted;
        // console.log("customization_navbar, ", configuration_restricted);

        access_token = nTc0uA7;
        isV1 = v1sI_;
        ghl_customization_service = { logo, ...qn2s7tI };
        if (ghl_customization_service?.conversations_count && access_token) {
          handleConversations();
        }

        if (ghl_customization_service?.logo) {
          handleLogo();
        } else {
          handleLogo(true);
        }
      }
    })
    .catch((err) => {
      console.log("failed ,", err);
    })
    .finally((_) => {
      if (!events_loaded_customization)
        setTimeout(() => {
          setupCustomizationGHLChangeEvents();
        }, 5000);
    });
}

init_main_customization();

function renderSideBarElements() {
  const ghl_sidebar_data = ghl_customization_sidebarItem;
  console.log(ghl_sidebar_data, "ghl_sidebar_data", typeof ghl_sidebar_data);

  var sideBar = document.querySelector("#sidebar-v2 nav.flex-1.w-full");
  var elementsInOrder = ghl_sidebar_data.map(function (element) {
    let el = null;

    if (element.type === "custommenulink") {
      try {
        const customMenuLinkId =
          element.url.split("/")[element.url.split("/").length - 1];

        el = sideBar.querySelector(`[id='${customMenuLinkId}']`);
      } catch (error) {
        console.log(error);
      }
    } else if (element.type === "customButton") {
      try {
        // Create the <a> element
        let link = document.createElement("div");
        link.innerHTML = `<a href="javascript:void(0)" class="w-full group px-3 flex items-center justify-start lg:justify-start
       xl:justify-start text-sm font-medium rounded-md cursor-pointer font-medium opacity-70 hover:opacity-100 py-2 md:py-2" id="sb_opportunities" exact-path-active-class="exact-path-active-class" meta="opportunities"><img src="https://storage.googleapis.com/highlevel-backend.appspot.com/sidebar-v2/icon_opportunities.svg" class="md:mr-0 h-5 w-5 mr-2 lg:mr-2 xl:mr-2"><span class="hl_text-overflow sm:hidden md:hidden nav-title lg:block xl:block">Opportunities</span></a>`;
        //  link.href = "";

        link = link.children[0];

        sideBar.appendChild(link);
        el = link;
      } catch (error) {
        console.log(error);
      }
    } else {
      el = sideBar.querySelector(`[id='${element.id}']`);
    }

    if (element.visible && el) {
      switch (element.type) {
        case "normal":
          el.querySelector(".nav-title").innerText = element.title;
          if (element.icon.new) {
            const iconTypesList = {
              iconType: (content) => {
                let spanElement = document.createElement("span");

                // Set the class attribute
                spanElement.setAttribute("class", "h-5 w-5 mr-2");

                // Create the i element
                let iElement = document.createElement("i");

                // Set the class attribute of the i element
                iElement.setAttribute("class", "sm-button nav-fa-icon");
                // Set the style attribute of the i element
                iElement.setAttribute("style", content);

                spanElement.appendChild(iElement);
                return spanElement;
              },
              imageType: (content) => {
                var imgElement = document.createElement("img");

                // Set the src attribute
                imgElement.setAttribute("src", content);

                // Set the class attribute
                imgElement.setAttribute(
                  "class",
                  "md:mr-0 h-5 w-5 mr-2 lg:mr-2 xl:mr-2"
                );

                imgElement.setAttribute("style", "padding:0px;");
                return imgElement;
              },

              svgType: (content) => {
                var emptyDiv = document.createElement("div");
                // Set the src attribute
                emptyDiv.innerHTML = content;
                return emptyDiv.childNodes[0];
              },
            };

            el.firstChild.replaceWith(
              iconTypesList[`${element.icon.type}Type`](element.icon.value)
            );
          }
          break;
        case "customButton":
          el.querySelector(".nav-title").innerText = element.title;
          const iconTypesList = {
            iconType: (content) => {
              let spanElement = document.createElement("span");

              // Set the class attribute
              spanElement.setAttribute("class", "h-5 w-5 mr-2");

              // Create the i element
              let iElement = document.createElement("i");

              // Set the class attribute of the i element
              iElement.setAttribute("class", "sm-button nav-fa-icon");
              // Set the style attribute of the i element
              iElement.setAttribute("style", content);

              spanElement.appendChild(iElement);
              return spanElement;
            },
            imageType: (content) => {
              var imgElement = document.createElement("img");

              // Set the src attribute
              imgElement.setAttribute("src", content);

              // Set the class attribute
              imgElement.setAttribute(
                "class",
                "md:mr-0 h-5 w-5 mr-2 lg:mr-2 xl:mr-2"
              );

              imgElement.setAttribute("style", "padding:0px;");
              return imgElement;
            },

            svgType: (content) => {
              var emptyDiv = document.createElement("div");
              // Set the src attribute
              emptyDiv.innerHTML = content;
              return emptyDiv.childNodes[0];
            },
          };

          el.firstChild.replaceWith(
            iconTypesList[`${element.icon.type}Type`](element.icon.value)
          );
          el.addEventListener("click", function (ev) {
            ev.preventDefault();
            if (element.event) {
              switch (element.event) {
                case "external_page":
                  if (element.external_url) {
                    window.open(element.external_url, "_blanc");
                  }
                  break;

                case "custom_menu_link":
                  if (element.external_url) {
                    try {
                      const customMenuLinkId =
                        element.external_url.split("/")[
                          element.external_url.split("/").length - 1
                        ];
                      document.getElementById("app").__vue__.$router.push({
                        name: "location-custom-menu-link-v2",
                        params: { id: customMenuLinkId, location_id },
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }
                  break;

                case "popup":
                  if (element.external_url) {
                    open_action_modal(element.external_url);
                  }
                  break;
                case "onboarding":
                  if ($("#onboardingPreview").length) {
                    $("#onboardingPreview").addClass("show");
                    $("#toggleOboardingPreview").hide();
                  }
                  break;
                default:
                  const cttemp = element.event.split(".");
                  cttemp.shift();
                  console.log(element.event);
                  const { action, name, params, query } = fetchFromObject(
                    cttemp.join(".")
                  );

                  document.getElementById("app").__vue__.$router.push({
                    name,
                    params: { ...params, location_id: location_id },
                    query: query ?? {},
                  });
                  break;
              }
            }
          });
          break;
        case "custommenulink":
          if (element.override_icon && element.icon) {
            const iconTypesList = {
              iconType: (content) => {
                let spanElement = document.createElement("span");

                // Set the class attribute
                spanElement.setAttribute("class", "h-5 w-5 mr-2");

                // Create the i element
                let iElement = document.createElement("i");

                // Set the class attribute of the i element
                iElement.setAttribute("class", "sm-button nav-fa-icon");
                // Set the style attribute of the i element
                iElement.setAttribute("style", content);

                spanElement.appendChild(iElement);
                return spanElement;
              },
              imageType: (content) => {
                var imgElement = document.createElement("img");

                // Set the src attribute
                imgElement.setAttribute("src", content);

                // Set the class attribute
                imgElement.setAttribute(
                  "class",
                  "md:mr-0 h-5 w-5 mr-2 lg:mr-2 xl:mr-2"
                );

                imgElement.setAttribute("style", "padding:0px;");
                return imgElement;
              },

              svgType: (content) => {
                var emptyDiv = document.createElement("div");
                // Set the src attribute
                emptyDiv.innerHTML = content;
                return emptyDiv.childNodes[0];
              },
            };

            el.firstChild.replaceWith(
              iconTypesList[`${element.icon.type}Type`](element.icon.value)
            );
          }
          break;

        default:
          break;
      }
      return el;
    } else {
      el?.remove();
      return null;
    }
  });
  elementsInOrder.reverse().forEach(function (element) {
    if (element) sideBar.insertBefore(element, sideBar.firstChild); // Inserts the element at the top of the parent element
  });
}

function generateNewSideBar({
  divider,
  title,
  meta,
  id,
  visible,
  icon: { type, value },
  routeName,
}) {
  if (divider) {
    const generateDivider = () => {
      var el = document.createElement("a");
      el.setAttribute("href", "javascript:void(0)");
      el.setAttribute(
        "class",
        "w-full group px-3 flex items-center justify-start sm:justify-center md:justify-center lg:justify-start xl:justify-start text-sm font-medium rounded-md cursor-pointer active text-gray-300 font-normal cursor-text divider"
      );
      el.setAttribute("id", id);
      el.setAttribute("exact-path-active-class", "exact-path-active-class");
      el.setAttribute("meta", meta);

      var p = document.createElement("p");
      p.setAttribute("class", "w-full text-left border-b border-solid my-3");
      p.setAttribute("style", "line-height: 0.1em; font-size: 10px;");

      el.appendChild(p);

      return el;
    };
    return generateDivider();
  }
  const titleElement = () => {
    let spanElement = document.createElement("span");

    // Set the class attribute
    spanElement.setAttribute(
      "class",
      "nav-title hl_text-overflow sm:hidden md:hidden lg:block xl:block"
    );

    // Set the text content
    spanElement.textContent = title;

    return spanElement;
  };

  const iconType = () => {
    let spanElement = document.createElement("span");

    // Set the class attribute
    spanElement.setAttribute("class", "h-5 w-5 mr-2");

    // Create the i element
    let iElement = document.createElement("i");

    // Set the class attribute of the i element
    iElement.setAttribute("class", "sm-button nav-fa-icon");
    // Set the style attribute of the i element
    iElement.setAttribute("style", value);

    spanElement.appendChild(iElement);
    return spanElement;
  };

  const imageType = () => {
    var imgElement = document.createElement("img");

    // Set the src attribute
    imgElement.setAttribute("src", value);

    // Set the class attribute
    imgElement.setAttribute("class", "md:mr-0 h-5 w-5 mr-2 lg:mr-2 xl:mr-2");
    return imgElement;
  };

  var wrapper = () => {
    let el = document.createElement("a");
    el.setAttribute("href", "javascript:void(0)");
    el.setAttribute("id", id);
    el.setAttribute("meta", meta);
    el.setAttribute(
      "class",
      `w-full group px-3 flex items-center justify-start md:justify-center lg:justify-start xl:justify-start text-sm rounded-md cursor-pointer custom-link font-medium opacity-70 hover:opacity-100 py-2 md:py-2 ${
        routeChangeEvent_customization.detail.to.name === routeName
          ? "active"
          : ""
      }`
    );
    el.addEventListener("click", function () {
      document.getElementById("app").__vue__.$router.push({
        name: routeName,
        params: { location_id },
      });
    });

    el.appendChild(type === "icon" ? iconType() : imageType());
    el.appendChild(titleElement());

    return el;
  };

  if (visible !== true) {
    navItem.remove();
  }

  return wrapper();
}

function changeFillColor() {
  const vprimaryValue = ghl_graphcolor;
  console.log("changeFillColor", vprimaryValue);
  const vcolor1 = vprimaryValue,
    vcolor2 = vprimaryValue,
    vcolor3 = vprimaryValue,
    vcolor4 = vprimaryValue,
    vcolor5 = vprimaryValue,
    vcolor6 = vprimaryValue,
    vcolor7 = vprimaryValue;

  const fillColorsMapping = {
    "rgb(83,177,253)": vcolor1,
    "#53B1FD": vcolor1,

    "rgb(82,139,255)": vcolor2,
    "#528BFF": vcolor2,

    "#8098F9": vcolor3,
    "rgb(128, 152, 249)": vcolor3,

    "rgb(34,204,238)": vcolor4,
    "#22CCEE": vcolor4,

    "rgb(54,191,250)": vcolor5,
    "#36BFFA": vcolor5,

    "rgb(103,227,249)": vcolor6,
    "#67E3F9": vcolor6,

    "rgb(91,194,255)": vcolor7,
    "#A48AFB": vcolor7,
    "rgb(83,177,253)": vcolor1,
    "rgb(91,194,255)": vcolor1,
  };

  // async function waitForCustomizeSvg() {
  let customize_svgs = document.querySelectorAll(".echarts");
  console.log(customize_svgs, "customize_svgs");

  customize_svgs = document.querySelectorAll(".echarts");

  customize_svgs.forEach((customize_svg) => {
    // Find all matching paths within the current '.echarts' element
    let matchingPaths = customize_svg.querySelectorAll("path[fill]");

    // Create an object to store color classes
    let colorClasses = {};

    matchingPaths.forEach((path) => {
      let currentFill = path.getAttribute("fill");
      console.log("Current Fill", currentFill);

      if (fillColorsMapping[currentFill]) {
        // Update fill and stroke with the mapped color
        path.setAttribute("fill", fillColorsMapping[currentFill]);
        path.setAttribute("stroke", fillColorsMapping[currentFill]);

        // Add a custom class based on the color
        if (!colorClasses[currentFill]) {
          colorClasses[currentFill] = `v-color-${
            Object.keys(colorClasses).length + 1
          }`;
        }
        path.classList.add(colorClasses[currentFill]);
      }
    });
  });
  // }

  // waitForCustomizeSvg();
}

function handleGhlSideBar() {
  let tried = 0;
  const waitForSideBar = setInterval(() => {
    console.log("majors: ");
    if (document.querySelector("#sidebar-v2 nav.flex-1.w-full")) {
      clearInterval(waitForSideBar);
      renderSideBarElements();
    } else {
      if (tried > limit_try_customization) {
        clearInterval(waitForSideBar);
      }
    }
    tried++;
  }, 500);
}


function handleGhlNavbar() {
  let tried = 0;
  const waitForNav = setInterval(() => {
    if (document.querySelector(".container-fluid > .hl_header--controls")) {
      clearInterval(waitForNav);
      let navItems = ghl_customization_navItem;
      let container = document.querySelector(
        ".container-fluid > .hl_header--controls"
      );

      document
        .querySelectorAll(
          ".container-fluid > .hl_header--controls [data-customization]"
        )
        .forEach((el) => {
          el.remove();
        });

      let avatar = document.querySelector(
        ".container-fluid > .hl_header--controls"
      ).lastChild;

      let newNavBarArray = [...navItems];

      newNavBarArray = navItems.map(function (element) {
        let parentNavItem = container.querySelector(
          element.parent ?? `[id='${element.id}']`
        );

        let navItem = element.parent
          ? parentNavItem?.querySelector(`[id='${element.id}']`)
          : parentNavItem;

        if (element.id === "dialer-error-toggle") {
          navItem = navItem.parentElement.querySelector(
            'a[role="button"].dropdown-toggle[style=""]'
          );
        }

        if (element.new) {
          let newLink = document.createElement("a");
          newLink.id = element.id;
          newLink.setAttribute("data-customization", "");
          newLink.className = "btn btn-circle";
          newLink.title = element.tooltip;
          newLink.href = "";
          newLink.style.display = "flex";
          newLink.style.padding = `0px ${element.padding}px`;
          newLink.style.alignItems = "center";
          newLink.style.justifyContent = "center";
          newLink.style.setProperty("display", "flex", "important");
          newLink.style.setProperty("align-items", "center", "important");
          newLink.style.setProperty("justify-content", "center", "important");
          newLink.style.borderRadius = "50%"; // Add border-radius here
          newLink.style.backgroundColor = element.backgroundColor;

          let icon;
                    
          if (element.icon.type === "image") {
            // Handle image icons
            icon = document.createElement("img");
            icon.src = element.icon.value;
            icon.alt = "Icon";
            icon.style.borderRadius = "50%"; // Ensure image icons are circular
            icon.style.height = "100%";
            icon.style.width = "100%";
            icon.style.objectFit = "cover"; // Use "cover" for proper fit
          } else if (element.icon.type === "svg") {
            icon = document.createElement("div");
            icon.innerHTML = element.icon.value;
          
            const svgElement = icon.querySelector("svg");
            if (svgElement) {
              svgElement.removeAttribute("fill"); // Removes the inline fill attribute from the SVG
              svgElement.style.setProperty("fill", element.color, "important"); // Sets the new fill color
          
              const paths = svgElement.querySelectorAll("path");
              paths.forEach((path) => {
                path.removeAttribute("fill"); // Removes inline fill attributes from each path
                path.style.setProperty("fill", element.color, "important"); // Sets the new fill color
              });
            }
          } else {

            // icon = document.createElement("i");
            // icon.className = element.icon.value;
            // icon.style.setProperty("color", element.color, "important");
            icon = document.createElement("i");
            icon.className = element.icon.value;
            // const classesToRemove = ["text-white", "other-conflicting-class"]; 
            // classesToRemove.forEach((cls) => icon.classList.remove(cls));
            icon.style.removeProperty("color"); 
            icon.style.setProperty("color", element.color, "important");
          }

          newLink.appendChild(icon);

          if (element.title) {
            newLink.style.width = "auto";
            let srOnly = document.createElement("span");
            srOnly.className = "ml-1 sr-onlybbb";
            srOnly.textContent = element.title;
            srOnly.setAttribute("data-customization", "");
            newLink.appendChild(srOnly);
          }

          return newLink;
        } else {
          if (navItem) {
            let spanElements = navItem.getElementsByTagName("span");
            for (let i = 0; i < spanElements.length; i++) {
              spanElements[i].style.setProperty(
                "background-color",
                element?.backgroundColor,
                "important"
              );
            }

            if (element.visible !== true) {
              navItem.remove();
              return null;
            }

            navItem.style.backgroundColor = element?.backgroundColor;
            navItem.style.color = element?.color;
            navItem.style.padding = `0px ${element.padding}px`;
            navItem.style.display = "flex";
            navItem.style.justifyContent = "center";
            navItem.style.alignItems = "center";
            navItem.style.borderRadius = "50%"; // Add border-radius for existing elements

            if (element.icon.new) {
              if (element.icon.type === "image") {
                let parent = navItem.querySelector("i").parentNode;
                let imgIcon = document.createElement("img");
                imgIcon.stAttribuyle.height = "14px";
                imgIcon.style.width = "14px";
                imgIcon.style.borderRadius = "50%"; // Ensure image icons are circular
                imgIcon.sette("src", element.icon.value);
                navItem.querySelector("i").replaceWith(imgIcon);
              }else if (element.icon.type === "svg") {
                icon = document.createElement("div");
                icon.innerHTML = element.icon.value;
              
                const svgElement = icon.querySelector("svg");
                if (svgElement) {
                  svgElement.removeAttribute("fill"); 
                  svgElement.style.setProperty("fill", element.color, "important"); 
              
                  const paths = svgElement.querySelectorAll("path");
                  paths.forEach((path) => {
                    path.removeAttribute("fill"); 
                    path.style.setProperty("fill", element.color, "important"); 
                  });
                }
              } else {
                console.log(navItem.querySelector("i"),"Please select");
                

                let icon = document.createElement("i");
                icon.className = element.icon.value;
                icon.style.removeProperty("color"); 
                icon.style.setProperty("color", element.color, "important");
                navItem.appendChild(icon);  
                navItem.querySelector("i").replaceWith(icon);

                console.log(navItem,"items");


               
              }
            }

            if (element.title) {
              navItem.style.width = "auto";
              if (!navItem.querySelector(".ml-1.sr-onlybbb")) {
                let srOnly = document.createElement("span");
                srOnly.className = "ml-1 sr-onlybbb";
                srOnly.setAttribute("data-customization", "");
                srOnly.textContent = element.title;
                navItem.appendChild(srOnly);
              }
            }

            return parentNavItem;
          } else return null;
        }
      });

      newNavBarArray.push(avatar);

      newNavBarArray.reverse().forEach(function (element) {
        if (element) container.insertBefore(element, container.firstChild);
      });
    } else {
      if (tried > limit_try_customization) {
        clearInterval(waitForNav);
      }
    }
    tried++;
  }, 500);
}


function handleGhlgraph() {
  let tried = 0;
  const waitForGraph = setInterval(() => {
    console.log("majors: ");
    if (document.querySelector(".echarts")) {
      clearInterval(waitForGraph);
      changeFillColor();
      setupDashboardGraphMutation();
    } else {
      if (tried > limit_try_customization) {
        clearInterval(waitForGraph);
      }
    }
    tried++;
  }, 500);
}

function setupDashboardGraphMutation() {
  ghl_customization_dashboard_observer = new MutationObserver(
    (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.target.classList.contains("echarts")) {
          changeFillColor();
        }
      }
    }
  );

  document.querySelectorAll(".echarts").forEach((element) => {
    ghl_customization_dashboard_observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });
}

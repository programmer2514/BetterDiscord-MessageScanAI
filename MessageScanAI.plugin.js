/**
 * @name MessageScanAI
 * @author TenorTheHusky
 * @authorId 563652755814875146
 * @description Adds a button to scan messages for phishing/scams with AI
 * @version 1.1.0
 * @donate https://ko-fi.com/benjaminpryor
 * @patreon https://www.patreon.com/BenjaminPryor
 * @website https://github.com/programmer2514/BetterDiscord-MessageScanAI
 * @source https://raw.githubusercontent.com/programmer2514/BetterDiscord-MessageScanAI/main/MessageScanAI.plugin.js
 */

module.exports = (() => {
  // Define plugin configuration
  const config = {
    info: {
      name: 'MessageScanAI',
      authors: [{
        name: 'TenorTheHusky',
        discord_id: '563652755814875146',
        github_username: 'programmer2514',
      },
      ],
      version: '1.1.0',
      description: 'Adds a button to scan messages for phishing/scams with AI',
      github: 'https://github.com/programmer2514/BetterDiscord-MessageScanAI',
      github_raw: 'https://raw.githubusercontent.com/programmer2514/BetterDiscord-MessageScanAI/main/MessageScanAI.plugin.js',
    },
    changelog: [{
      title: '1.1.0',
      items: [
        'Fixed plugin not loading on reload or after message edit',
        'Fixed plugin occasionally breaking due to BDFDB randomly reloading the entire UI',
      ],
    }, {
      title: '1.0.0',
      items: [
        'Initial release',
      ],
    },
    ],
  };

  // Check for ZeresPluginLibrary
  if (!window.ZeresPluginLibrary) {
    return class {
      load = () => {
        BdApi.UI.showConfirmationModal(
          'Library Missing',
          `The library plugin needed for ${config.info.name} is missing. \
            Please click Download Now to install it.`, {
            confirmText: 'Download Now',
            cancelText: 'Cancel',
            onConfirm: () => {
              require('request')
                .get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js',
                  async (err, _response, body) => {
                    if (err) {
                      return require('electron').shell
                        .openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
                    }
                    await new Promise(r => require('fs').writeFile(require('path')
                      .join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
                  });
            },
          });
      };

      start = () => {};
      stop = () => {};
    };
  }

  // Build plugin
  const [Plugin, Library] = ZeresPluginLibrary.buildPlugin(config);

  // Define plugin class
  return class MessageScanAI extends Plugin {
    // Get plugin metadata
    constructor(meta) {
      super();
      this.meta = meta;
    }

    // Initialize the plugin when it is enabled
    start = async () => {
      // Ensure modals are only shown once
      this.modalShown = false;

      if (Library.DiscordModules.UserStore.getCurrentUser()) {
        console.log(`%c[${this.meta.name}] ` + '%cAttempting pre-load...',
          'color: #3a71c1; font-weight: 700;', '');
        await this.initialize();
      }
      if (!this.modalShown)
        Library.DiscordModules.Dispatcher.subscribe('POST_CONNECTION_OPEN',
          this.initialize);
      console.log(`%c[${this.meta.name}] `
        + `%c(v${this.meta.version}) `
        + '%chas started.', 'color: #3a71c1; font-weight: 700;',
      'color: #666; font-weight: 600;', '');
    };

    // Terminate the plugin when it is disabled
    stop = async () => {
      this.terminate();

      console.log(`%c[${this.meta.name}] `
        + `%c(v${this.meta.version}) `
        + '%chas stopped.', 'color: #3a71c1; font-weight: 700;',
      'color: #666; font-weight: 600;', '');
    };

    // Re-initialize plugin on switch
    onSwitch = () => { this.initialize(); };

    // Main plugin code
    initialize = async () => {
      // Make this accessable to arrow functions
      let _this = this;

      // Ensure plugin is ready to load
      if (!document.querySelector('.buttonContainer_f9f2ca')) {
        setTimeout(() => {
          _this.initialize();
        }, 250);
        return;
      }

      // Clean up old buttons
      this.terminate();

      // Abstract classes
      this.appLayers = 'layers_a01fb1';
      this.appWrapper = 'app_a01fb1';
      this.injectPoint = 'buttonContainer_f9f2ca';
      this.messageContent = 'messageContent_f9f2ca';
      this.messageListItem = 'messageListItem_d5deea';
      this.observedContainer = document.querySelector('.app_bd26cc');

      // Initialize button icons
      this.iconScan = `
        <path fill="currentColor" fill-rule="evenodd" d="M9.9,23c-.4,0-.8-.3-1-.7l-1.7-4.5c0-.2-.2-.3-.4-.4l-4.5-1.7c-.6-.2-.8-.8-.6-1.4,0-.3.3-.5.6-.6l4.5-1.7c.2,0,.4-.2.4-.4l1.7-4.5c.2-.6.8-.8,1.4-.6.3,0,.5.3.6.6l1.7,4.5c0,.2.2.3.4.4l4.4,1.7c.4.2.7.6.7,1s-.3.8-.7,1l-4.4,1.8c-.2.1-.3.2-.4.4l-1.7,4.5c0,.3-.5.6-1,.6ZM12.7,12h0Z" clip-rule="evenodd" class/>
        <path fill="currentColor" fill-rule="evenodd" d="M4.8,8.6c-.3,0-.5-.2-.6-.4l-.7-1.9c0,0,0,0-.2-.2l-1.9-.7c-.3-.2-.5-.5-.4-.8,0-.2.2-.3.4-.4l1.9-.7c0,0,0,0,.2-.2l.7-1.9c0-.2.3-.4.5-.4.3,0,.6.1.7.4l.7,1.9c0,0,0,0,.2.2l1.9.7c.3.1.4.5.3.8,0,.2-.2.3-.3.4l-1.9.7c0,0,0,0-.2.2l-.7,1.9c0,.2-.4.4-.6.4Z" clip-rule="evenodd" class/>
        <path fill="currentColor" fill-rule="evenodd" d="M18.1,12c-.3,0-.5-.2-.6-.4l-1-2.6c0-.1,0-.2-.2-.2l-2.6-1c-.4,0-.5-.5-.4-.9,0-.2.2-.3.4-.4l2.6-1c0,0,.2,0,.2-.2l1-2.5c0-.2.3-.4.6-.5.3,0,.6,0,.7.4l1,2.6c0,0,0,.2.2.2l2.6,1c.4,0,.5.5.4.9,0,.2-.2.3-.4.4l-2.6,1c0,0-.2.1-.2.2l-1,2.6c-.2.2-.4.4-.7.4Z" clip-rule="evenodd" class/>
      `;
      this.iconClear = `
        <path fill="currentColor" fill-rule="evenodd" d="M9.4,12.5c-.9-.9-.9-2.3,0-3.2s1-.7,1.6-.7.3,0,.4,0l-.6-1.6c0-.3-.3-.5-.6-.6-.6-.2-1.2,0-1.4.6l-1.7,4.5c0,.2-.2.4-.4.4l-4.5,1.7c-.3.1-.5.3-.6.6-.2.6,0,1.2.6,1.4l4.5,1.7c.2,0,.3.2.4.4l1.6,4.3c0-.6.2-1.2.7-1.6l3.9-4-3.9-4Z" clip-rule="evenodd" class/>
        <path fill="currentColor" fill-rule="evenodd" d="M4.8,8.6c-.3,0-.5-.2-.6-.4l-.7-1.9c0,0,0,0-.2-.2l-1.9-.7c-.3-.2-.5-.5-.4-.8,0-.2.2-.3.4-.4l1.9-.7c0,0,0,0,.2-.2l.7-1.9c0-.2.3-.4.5-.4.3,0,.6.1.7.4l.7,1.9c0,0,0,0,.2.2l1.9.7c.3.1.4.5.3.8,0,.2-.2.3-.3.4l-1.9.7c0,0,0,0-.2.2l-.7,1.9c0,.2-.4.4-.6.4Z" clip-rule="evenodd" class/>
        <path fill="currentColor" fill-rule="evenodd" d="M23,7.4c-.1.2-.2.3-.4.4l-2.6,1c-.1,0-.2.1-.2.2l-.6,1.7-1.2,1.3c-.2,0-.3-.2-.4-.4l-1-2.6c0-.1,0-.2-.2-.2l-2.6-1c-.4,0-.5-.5-.4-.9,0-.2.2-.3.4-.4l2.6-1c.1,0,.2,0,.2-.2l1-2.5c.1-.2.3-.4.6-.5.3,0,.6,0,.7.4l1,2.6c0,0,0,.2.2.2l2.6,1c.4,0,.5.5.4.9Z" clip-rule="evenodd" class/>
        <path fill="currentColor" fill-rule="evenodd" d="M10.4,10.3c.4-.4.9-.4,1.3,0,0,0,0,0,0,0l4.9,4.9,4.9-4.9c.4-.4.9-.4,1.3,0s.4,1,0,1.3l-4.9,4.9,4.9,4.9c.4.4.4,1,0,1.3s-.9.4-1.3,0l-4.9-4.9-4.9,4.9c-.4.4-.9.4-1.3,0s-.4-1,0-1.3l4.9-4.9-4.9-4.9c-.4-.4-.4-.9,0-1.3,0,0,0,0,0,0" clip-rule="evenodd" class/>
      `;

      // Initialize state variables
      this.tosAccepted = BdApi.getData(this.meta.name, 'tosAccepted') === 'true';
      this.apiKey = BdApi.getData(this.meta.name, 'apiKey');

      // Show setup modals
      if (!this.tosAccepted) this.showTosModal();
      else if (!this.apiKey) this.showSetupModal();

      // Insert buttons
      for (let node of document.querySelectorAll('.' + this.injectPoint)) {
        this.injectButton(node);
      }

      // Add mutation observer to insert new buttons as needed
      this.messageObserver = new MutationObserver((mutationList) => {
        setTimeout(() => {
          mutationList.forEach((mutationRecord) => {
            mutationRecord.addedNodes.forEach((node) => {
              if (node.classList?.contains(_this.injectPoint))
                _this.injectButton(node);

              // BDFDB compatibility
              if (node.classList?.contains(_this.appLayers) || node.classList?.contains(_this.appWrapper))
                _this.initialize();
            });
            if (mutationRecord.target.classList?.contains(_this.injectPoint)) {
              _this.injectButton(mutationRecord.target);
            }
          });
        }, 0);
      });

      this.messageObserver.observe(this.observedContainer, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    };

    // Undo UI changes and stop plugin code
    terminate = async () => {
      // Remove all injected elements and styles
      document.querySelectorAll('.msai-element').forEach((elem) => {
        elem.remove();
      });
      document.querySelectorAll('.msai-msg').forEach((elem) => {
        let targetMessage = elem;
        while (!targetMessage.classList.contains(this.messageListItem))
          targetMessage = targetMessage.parentElement;
        targetMessage.style.removeProperty('background');
        targetMessage.style.removeProperty('box-shadow');
        elem.remove();
      });

      // Stop mutation observer
      this.messageObserver?.disconnect();

      // Delete plugin fields
      delete(this.apiKey);
      delete(this.appLayers);
      delete(this.appWrapper);
      delete(this.iconClear);
      delete(this.iconScan);
      delete(this.injectPoint);
      delete(this.messageContent);
      delete(this.messageListItem);
      delete(this.messageObserver);
      delete(this.observedContainer);
      delete(this.tosAccepted);
    };

    getSettingsPanel = () => {
      // Make this accessable to arrow functions
      let _this = this;

      // Create root settings node
      var settingsRoot = new Library.Settings.SettingPanel();

      // Create API key textbox
      var settingApiKey = new Library.Settings.Textbox(
        'Gemini API Key',
        'The API key used to authenticate with the Google Gemini API',
        BdApi.getData(this.meta.name, 'apiKey'),
        (text) => {
          BdApi.setData(this.meta.name, 'apiKey', text);
          _this.apiKey = text;
        },
        { placeholder: 'API key (Ex: XXxxXxXX0xX0XXXxXX0XXxXxxxXXx0xxXxx0XXx)' },
      );

      settingsRoot.append(settingApiKey);
      return settingsRoot.getElement();
    };

    injectButton = (parentNode) => {
      try {
        // Create new button by cloning existing button and insert it before original
        let discordButton = parentNode.firstElementChild.firstElementChild.firstElementChild;
        let newButton = discordButton.cloneNode(true);
        discordButton.before(newButton);

        // Update new button to look how we want
        newButton.classList.add('msai-element');
        BdApi.UI.createTooltip(newButton, 'Scan With AI');
        newButton.setAttribute('aria-label', 'Scan With AI');
        newButton.removeAttribute('aria-expanded');
        newButton.firstElementChild.innerHTML = this.iconScan;

        // Update new button to act how we want
        newButton.addEventListener('click', async (e) => {
          // Get parent message of clicked button
          let targetMessage = e.target;
          while (!targetMessage.classList.contains(this.messageListItem))
            targetMessage = targetMessage.parentElement;

          // Get message body
          let messageBody = targetMessage.querySelector('.' + this.messageContent);

          // Clear message instead of generating a new one if one is already present
          if (messageBody.querySelector('.msai-msg')) {
            messageBody.querySelector('.msai-msg').remove();
            targetMessage.style.removeProperty('background');
            targetMessage.style.removeProperty('box-shadow');

            // Return button to normal
            newButton.firstElementChild.innerHTML = this.iconScan;
            newButton.setAttribute('aria-label', 'Scan With AI');
            BdApi.UI.createTooltip(newButton, 'Scan With AI');
            return;
          }

          // Run text through AI
          let isScam = await this.askAI(targetMessage.textContent);
          if (isScam === null) return;

          // Set new icon/tooltip/label for clicked button
          newButton.firstElementChild.innerHTML = this.iconClear;
          newButton.setAttribute('aria-label', 'Clear AI Scan');
          BdApi.UI.createTooltip(newButton, 'Clear AI Scan');

          // Highlight message based on result
          if (isScam) {
            targetMessage.style.background = 'rgba(255, 0, 0, 0.2)';
            targetMessage.style.boxShadow = '2px 0 0 0 red inset';
            messageBody.innerHTML += '<div class="msai-msg" style="color: red; font-size: 75%;">THIS MESSAGE IS LIKELY A SCAM</div>';
          }
          else {
            targetMessage.style.background = 'rgba(0, 255, 0, 0.2)';
            targetMessage.style.boxShadow = '2px 0 0 0 green inset';
            messageBody.innerHTML += '<div class="msai-msg" style="color: green; font-size: 75%;">This message is likely safe</div>';
          }
        });
      }
      catch {}
    };

    // Shows a ToS accept/decline modal
    showTosModal = () => {
      // Make this accessable to arrow functions
      let _this = this;

      this.modalShown = true;
      BdApi.UI.showConfirmationModal(
        'Google Gemini Terms of Service',
          `**MessageScanAI** makes use of the Google Gemini API to provide you
           with accurate scam and phishing information. Use of this plugin is
           subject to the [Google Gemini Terms of Service and Privacy Policy](https://ai.google.dev/gemini-api/terms).
           \nBy clicking "Accept", you agree to the aforementioned Terms and
           waive the developer of the MessageScanAI plugin of any responsibility
           for your use of the Gemini platform via this plugin.
           \n*This plugin respects your privacy and will not send any data to
           Google unless the "scan" button is clicked. In the event that the
           "scan" button is clicked, only the contents of that particular message
           will be sent to Google.* ***Be aware that Google may use any messages
           scanned by this plugin to train its AI model.***
          `,
          {
            danger: true,
            confirmText: 'Accept',
            cancelText: 'Decline',
            onConfirm: () => {
              _this.tosAccepted = true;
              BdApi.setData(this.meta.name, 'tosAccepted', 'true');
              this.initialize();
            },
            onCancel: () => {
              _this.tosAccepted = false;
              BdApi.setData(this.meta.name, 'tosAccepted', 'false');
              BdApi.Plugins.disable(this.meta.name);
            },
          },
      );
    };

    // Shows a setup prompt modal
    showSetupModal = () => {
      this.modalShown = true;
      BdApi.UI.showConfirmationModal(
        'Setup',
          `**MessageScanAI** needs a Google Gemini API key in order to work
           properly. Note that per Google's ToS, **you must be 18 in order to
           obtain a key.**
           \nTo continue, please select "Get API Key", create an API key in a
           new project, then head on over to MessageScanAI's plugin settings and
           paste it in the appropriate text box.`,
          {
            confirmText: 'Get API Key',
            cancelText: 'I already have a key',
            onConfirm: () => {
              require('electron').shell
                .openExternal('https://makersuite.google.com/app/apikey');
              BdApi.setData(this.meta.name, 'apiKey', 'Paste your API key here');
              this.initialize();
            },
            onCancel: () => {
              BdApi.setData(this.meta.name, 'apiKey', 'Paste your API key here');
              this.initialize();
            },
          },
      );
    };

    // Calls the Google Gemini API and returns whether a message is a scam or not
    askAI = async (message) => {
      const response = await BdApi.Net.fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `The following message was taken from a Discord chat.
                       This chat may have been with a bot or with a human.
                       Is it a dangerous scam or phishing attempt?
                       Respond with one word: "yes" or "no".
                       \n${message}`,
              }],
            }],
            safetySettings: [{
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            }, {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            }, {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            }, {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            }],
          }),
        },
      );
      if (!response.ok) {
        this.showSetupModal();
        return null;
      }

      const json = await response.json();
      return json.candidates[0].content.parts[0].text.toLowerCase().includes('yes');
    };
  };
})();

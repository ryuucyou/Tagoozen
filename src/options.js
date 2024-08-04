document.addEventListener('DOMContentLoaded', () => {
    const addTagBtn = document.getElementById('addTagBtn');
    const tagForm = document.getElementById('tagForm');
    const editTagForm = document.getElementById('editTagForm');
    const tagsTableBody = document.querySelector('#tagoozen-tags-table tbody');
  
    document.getElementById('languageSelector');
  
    let language = 'en'; // Default language
  
    function loadLanguage(language) {
      fetch(chrome.runtime.getURL(`src/${language}.json`))
        .then(response => response.json())
        .then(translations => {
          document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
              el.textContent = translations[key];
            }
          });
        })
        .catch(error => console.error('Error loading language file:', error));
    }
  
    languageSelector.addEventListener('change', (event) => {
      language = event.target.value;
      loadLanguage(language);
    });
  
    loadLanguage(language);
  
  
    addTagBtn.addEventListener('click', () => {
      tagForm.style.display = 'block';
      adjustOptionsBasedOnShape(shapeSelect.value, positionSelect, backgroundColorInput);
    });
  
// shapeによって、位置や背景色のオプションが異なる
    const shapeSelect = document.getElementById('shape');
    const positionSelect = document.getElementById('position');
    const backgroundColorInput = document.getElementById('backgroundColorContainer');

    const editShapeSelect = document.getElementById('editShape');
    const editPositionSelect = document.getElementById('editPosition');
    const editBackgroundColorInput = document.getElementById('editBackgroundColorContainer');

    function adjustOptionsBasedOnShape(shape, positionElement, backgroundColorElement) {
      positionElement.innerHTML = '';
      if (shape === 'watermark') {
        backgroundColorElement.style.display = 'none';
        positionElement.parentElement.style.display = 'none';
      } else {
        backgroundColorElement.style.display = 'block';
        positionElement.parentElement.style.display = 'block';
        if (shape === 'triangle' || shape === 'ribbon') {
          positionElement.innerHTML += '<option value="left">Left</option>';
          positionElement.innerHTML += '<option value="right">Right</option>';
        } else if (shape === 'rectangle') {
          positionElement.innerHTML += '<option value="top">Top</option>';
          positionElement.innerHTML += '<option value="bottom">Bottom</option>';
        } else {
          positionElement.innerHTML += '<option value="left">Left</option>';
          positionElement.innerHTML += '<option value="right">Right</option>';
          positionElement.innerHTML += '<option value="top">Top</option>';
          positionElement.innerHTML += '<option value="bottom">Bottom</option>';
        }
      }
    }
    shapeSelect.addEventListener('change', () => {
      adjustOptionsBasedOnShape(shapeSelect.value, positionSelect, backgroundColorInput);
    });

    editShapeSelect.addEventListener('change', () => {
      adjustOptionsBasedOnShape(editShapeSelect.value, editPositionSelect, editBackgroundColorInput);
    });


    document.getElementById('newTagForm').addEventListener('submit', (event) => {
      event.preventDefault();
      saveTag();
    });
  
    document.getElementById('cancelBtn').addEventListener('click', () => {
      tagForm.style.display = 'none';
    });
  
    document.getElementById('saveEditTagBtn').addEventListener('click', () => {
      const index = document.getElementById('editTagFormElement').dataset.index;
      saveEditedTag(index);
    });
  
    document.getElementById('cancelEditTagBtn').addEventListener('click', () => {
      editTagForm.style.display = 'none';
    });
  
    function loadTags() {
      chrome.storage.local.get({ tags: [] }, (result) => {
        const tags = result.tags;
        if (tags.length === 0) {
          fetch(chrome.runtime.getURL('src/defaultTags.json'))
            .then(response => response.json())
            .then(defaultTags => {
              chrome.storage.local.set({ tags: defaultTags }, () => {
                displayTags(defaultTags);
              });
            })
            .catch(error => console.error('Error loading default tags:', error));
        } else {
          displayTags(tags);
        }
      });
    }
  
    function displayTags(tags) {
      tagsTableBody.innerHTML = '';
  
      tags.forEach((tag, index) => {
        const row = document.createElement('tr');
        const position = (tag.shape === 'watermark') ? '-' : tag.position;
        const backgroundColor = (tag.shape === 'watermark') ? '-' : tag.backgroundColor;
        row.innerHTML = `
          <td>${tag.tagName}</td>
          <td>${tag.shape}</td>
          <td>${position}</td>
          <td style="background-color: ${tag.shape !== 'watermark' ? tag.backgroundColor : 'transparent'};">${backgroundColor}</td>
          <td style="color: ${tag.textColor};background-color: ${tag.shape !== 'watermark' ? tag.backgroundColor : 'transparent'};">${tag.textColor}</td>
          <td>${tag.matchType}</td>
          <td>${tag.domainValue}</td>
          <td>
            <button class="tagoozen-button" id="editBtn-${index}" data-i18n="edit">Edit</button>
            <button class="tagoozen-button" id="deleteBtn-${index}" data-i18n="delete">Delete</button>
          </td>
        `;
        tagsTableBody.appendChild(row);
      });

      function triggerEditForm(index) {
        const tag = tags[index];
        openEditForm(tag, index);
      }
    
      tags.forEach((tag, index) => {
        document.getElementById(`editBtn-${index}`).addEventListener('click', () => triggerEditForm(index));
        document.getElementById(`deleteBtn-${index}`).addEventListener('click', () => {
          deleteTag(index);
          loadLanguage(language);
        });
      });
    }


    function openEditForm(tag, index) {
      document.getElementById('editTagName').value = tag.tagName;
      document.getElementById('editShape').value = tag.shape;
      document.getElementById('editPosition').value = tag.position;
      document.getElementById('editBackgroundColor').value = tag.backgroundColor;
      document.getElementById('editTextColor').value = tag.textColor;
      document.getElementById('editMatchType').value = tag.matchType;
      document.getElementById('editDomainValue').value = tag.domainValue;
      
      adjustOptionsBasedOnShape(tag.shape, editPositionSelect, editBackgroundColorContainer);
      editTagFormElement.dataset.index = index;
      document.getElementById('editTagForm').style.display = 'block';
    }

    function saveTag() {
      const tag = {
        tagName: document.getElementById('tagName').value,
        backgroundColor: document.getElementById('backgroundColor').value,
        textColor: document.getElementById('textColor').value,
        position: document.getElementById('position').value,
        matchType: document.getElementById('matchType').value,
        shape: document.getElementById('shape').value,
        domainValue: document.getElementById('domainValue').value,
      };
  
      chrome.storage.local.get({ tags: [] }, (result) => {
        const tags = result.tags || [];
        tags.push(tag);
        chrome.storage.local.set({ tags }, () => {
          displayTags(tags);
          document.getElementById('newTagForm').reset();
          tagForm.style.display = 'none';
        });
      });
    }
  
    function saveEditedTag(index) {
      const updatedTag = {
        tagName: document.getElementById('editTagName').value,
        backgroundColor: document.getElementById('editBackgroundColor').value,
        textColor: document.getElementById('editTextColor').value,
        shape: document.getElementById('editShape').value,
        position: document.getElementById('editPosition').value,
        matchType: document.getElementById('editMatchType').value,
        domainValue: document.getElementById('editDomainValue').value,
      };
  
      chrome.storage.local.get({ tags: [] }, (result) => {
        const tags = result.tags || [];
        tags[index] = updatedTag;
        chrome.storage.local.set({ tags }, () => {
          displayTags(tags);
          editTagForm.style.display = 'none';
        });
      });
    }

    function deleteTag(index) {
      chrome.storage.local.get({ tags: [] }, (result) => {
        const tags = result.tags || [];
        if (index >= 0 && index < tags.length) {
          tags.splice(index, 1);
          chrome.storage.local.set({ tags }, () => {
            displayTags(tags);
          });
        } else {
          console.error('Invalid tag index:', index);
        }
      });
    }
  
    loadTags();
  });

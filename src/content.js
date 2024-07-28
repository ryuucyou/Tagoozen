chrome.storage.local.get({ tags: [] }, function(result) {
  const tags = result.tags || [];
  const currentURL = window.location.hostname;

  tags.forEach(tag => {
    let isMatch = false;
    switch (tag.matchType) {
      case 'regex':
        const regex = new RegExp(tag.domainValue);
        isMatch = regex.test(currentURL);
        break;
      case 'prefix':
        isMatch = currentURL.startsWith(tag.domainValue);
        break;
      case 'suffix':
        isMatch = currentURL.endsWith(tag.domainValue);
        break;
      case 'contains':
        isMatch = currentURL.includes(tag.domainValue);
        break;
    }

    if (isMatch) {
      createMarker(tag);
    }
    function createMarker(tag) {
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.style.backgroundColor = tag.backgroundColor;
      marker.style.color = tag.textColor;
      const textSpan = document.createElement('span');
      textSpan.innerText = tag.tagName;
      marker.appendChild(textSpan);
    
      switch (tag.shape) {
        case 'triangle':
          marker.classList.add(tag.position === 'left' ? 'triangle-left' : 'triangle-right');
          break;
        case 'ribbon':
          marker.classList.add(tag.position === 'left' ? 'ribbon-left' : 'ribbon-right');
          break;
        case 'rectangle':
          marker.classList.add(tag.position === 'top' ? 'rectangle-top' : 'rectangle-bottom');
          break;
        case 'watermark':
          marker.classList.add('watermark');
          marker.style.backgroundColor = 'transparent';
          marker.innerHTML = `<span> ${tag.tagName} </span><br>`
          break;
        default:
          marker.classList.add('rectangle-top'); // Default shape
      }
    
      document.body.appendChild(marker);

      marker.addEventListener('click', () => {
        if (tag.shape !== 'watermark') {
          reverseTagPosition(marker, tag);
        }
      });
    }
    // 邪魔にならないように、タグをクリックすると、位置が変わる
    function reverseTagPosition(tagElement, tag) {
      const currentPos = tag.position;
      let newPos;
  
      if (tag.shape === 'triangle') {
        newPos = (currentPos === 'left') ? 'right' : 'left';
        tagElement.classList.remove(currentPos === 'left' ? 'triangle-left' : 'triangle-right');
        tagElement.classList.add(newPos === 'left' ? 'triangle-left' : 'triangle-right');
      } else if (tag.shape === 'ribbon') {
        newPos = (currentPos === 'left') ? 'right' : 'left';
        tagElement.classList.remove(currentPos === 'left' ? 'ribbon-left' : 'ribbon-right');
        tagElement.classList.add(newPos === 'left' ? 'ribbon-left' : 'ribbon-right');
      } else if (tag.shape === 'rectangle') {
        newPos = (currentPos === 'top') ? 'bottom' : 'top';
        tagElement.classList.remove(currentPos === 'top' ? 'rectangle-top' : 'rectangle-bottom');
        tagElement.classList.add(newPos === 'top' ? 'rectangle-top' : 'rectangle-bottom');
      }
  
      tag.position = newPos;
      chrome.storage.local.get({ tags: [] }, (result) => {
        const tags = result.tags || [];
        const tagIndex = tags.findIndex(t => t.tagName === tag.tagName);
        if (tagIndex !== -1) {
          tags[tagIndex].position = newPos;
          chrome.storage.local.set({ tags });
        }
      });
    }
  });
});
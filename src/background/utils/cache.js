const extension = window.chrome || window.extension;

export function cache(k, v) {
  const { local } = extension.storage; // eslint-disable-line

  return new Promise((resolve, reject) => {
    switch (arguments.length) {
      case 2:
        if (v === null) {
          local.remove([k], () => {
            const err = checkForError();
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          local.set({ [k]: JSON.stringify(v) }, () => {
            const err = checkForError();
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
        return;

      case 1:
        local.get([k], (result) => {
          const err = checkForError();
          if (err) {
            reject(err);
          } else {
            try {
              resolve(JSON.parse(result[k]));
            } catch (e) {
              resolve();
            }
          }
        });
        return;

      default:
        reject(new Error('provide k &/ v'));
    }
  });
}

function checkForError() {
  const { lastError } = extension.runtime; // eslint-disable-line
  if (!lastError) {
    return undefined;
  }
  // if it quacks like an Error, its an Error
  if (lastError.stack && lastError.message) {
    return lastError;
  }
  // repair incomplete error object (eg chromium v77)
  return new Error(lastError.message);
}

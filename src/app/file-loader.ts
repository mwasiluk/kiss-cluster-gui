export class FileLoader {

  static openFile(callback) {
    let input =  document.getElementById('kissc-file-input');
    input.onchange = loadFile;

    input.click();

    function loadFile() {

      var file, fr;


      if (typeof (window as any).FileReader !== 'function') {
        alert('error.fileApiNotSupported');
        return;
      }
      input =  document.getElementById('kissc-file-input');


      if (!(input as any).files) {
        alert('error.inputFilesProperty');
        return;
      }

      if (!(input as any).files[0]) {
        return;
      }

      file = (input as any).files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);


      function receivedText(e) {
        callback(e.target.result);
        (input as any).value = null;
      }
    }
  }

}

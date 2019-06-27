import { Component, OnInit } from '@angular/core';
import { FileListService, FileObjectForTransfere } from '../file-list.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserdetailsFetchService } from '../userdetails-fetch.service';
import { UploadFileService } from '../upload-file.service';


interface Alert {
  type: string;
  message: string;
}

export class ShareRequestObject {
  constructor(private toemail, private fromuserid, private permission, private fileid) { }
}

export class ResponseStatus{
  private status;

}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  closeResult: string;
  userid = sessionStorage.getItem("userid");
  fileListobject: FileObjectForTransfere[];
  viewfileurls = [];
  downloadfileurls = [];
  fileids = [];
  viewflag = [];
  fileType: String[] = [];
  private bodyText: string;
  formModelobject;
  useremails;
  selectedFiles: FileList;
  currentFileUpload: File;
  progress: { percentage: number } = { percentage: 0 };


 

  constructor(private uploadService: UploadFileService, private filelistservice: FileListService,private sanitizer: DomSanitizer, private modalService: NgbModal, private form: FormBuilder, private router: Router, private http: HttpClient, private userservice: UserdetailsFetchService) {
    this.allOfTheFetchingLogic();
  }

  allOfTheFetchingLogic(){
    // this.toDataURL('http://localhost:8080/viewdownload/view/5/22');
    this.filelistservice.getListOfFiles().subscribe(data => {
      this.fileListobject = data;
      console.log(data);
      //http://localhost:8080/viewdownload/view/{{userid}}/
      for (let i = 0; i < this.fileListobject.length; i++) {
        console.log("http://localhost:8080/viewdownload/view/" + this.userid + "/" + this.fileListobject[i].fileid);
        this.viewfileurls.push("http://localhost:8080/viewdownload/view/" + this.userid + "/" + this.fileListobject[i].fileid);
        this.downloadfileurls.push("http://localhost:8080/viewdownload/download/" + this.userid + "/" + this.fileListobject[i].fileid);
        this.viewflag.push(false);
        let name: String = this.fileListobject[i].filename;
        this.fileids.push(this.fileListobject[i].fileid);
        let type = name.substring((name.length - 3), name.length);
        if (type === 'png' || type === 'jpg') {
          this.fileType.push('image');
          this.viewfileurls[i] = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewfileurls[i]);
        } else if (type === 'mp3') {
          this.fileType.push('audio');
          this.viewfileurls[i] = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewfileurls[i]);
        } else if (type === 'mkv' || type === 'mp4') {
          this.fileType.push('video');
          this.viewfileurls[i] = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewfileurls[i]);
        } else if (type === 'pdf' || type === 'doc' || type==='txt') {
          this.fileType.push('PDF');
          this.viewfileurls[i] = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewfileurls[i]);
        } else {
          this.fileType.push('Other');
          this.viewfileurls[i] = this.sanitizer.bypassSecurityTrustResourceUrl(this.viewfileurls[i]);
        }
        //console.log((name.length-(name.length-3))+"  "+name+" "+name.length+"  "+type+" t "+this.fileType);
      }
    });

    this.formModelobject = this.form.group({
      useremail: '',
      permission: ''
    });
  }

  ngOnInit() {
    this.userservice.getListOfUsers().subscribe(data => {
      this.useremails = data;
    });
  }
  view(index) {
    this.viewflag[index] = !this.viewflag[index];
  }

  download(index) {
    console.log(index);
    window.open(this.downloadfileurls[index]);
  }



  open(content) {
    this.progress.percentage=0;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      console.log(`with: ${reason}`);
      return `with: ${reason}`;
    }
  }

  shareformsubmissionflag=false ;
  shareformsubmissionflagerro=false ;
  shareformdatapermission;

  setPermission(index){
    if(index==='1'){
      this.shareformdatapermission='READ';
    }else if(index=== '2'){
      this.shareformdatapermission='UPDATE';
    }else if(index === '3'){
      this.shareformdatapermission='DELETE';
    }
  }

  submitFormForShare(shareformdata, index) {
    console.log(shareformdata.useremail + " s " + index);
    if(shareformdata.useremail===''){
      window.alert("Please put a valid Email address");
      return ;
    }
    debugger;
    const header = new HttpHeaders().set("Authorization", `Bearer ${sessionStorage.getItem("token")}`);
    return this.http.post<ResponseStatus>('http://localhost:8080/viewdownload/share/' + this.fileids[index], new ShareRequestObject(shareformdata.useremail, sessionStorage.getItem("userid"), this.shareformdatapermission, this.fileids[index]), { headers: header })
      .subscribe(data => {
        debugger;
        console.log(data);
        this.shareformsubmissionflag=true;
      },
        error => {
          debugger;
          console.log(error);
          this.shareformsubmissionflagerro = true;
        });
  }

  uploadVersion(index) {

  }

  closeerror(alert: Alert) {
    this.shareformsubmissionflagerro = false;
  }

  closeSuccessfull(alert: Alert) {
    this.shareformsubmissionflag = false;
  }

  public model: any;
  public emailfromformdata: any;


  // formatter = (result: string) => result.toUpperCase();

  // search = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map(term => term === '' ? []
  //       : this.useremails.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  //   )

  //delete file 
  firstarray;
  secondarray;
  delete(index) {
    this.filelistservice.deletefile(this.fileListobject[index].fileid);
    console.log("deleted Successfully");
    this.firstarray = this.fileListobject.slice(0, index);
    this.secondarray = this.fileListobject.slice(index + 1, this.fileListobject.length);
    console.log(this.fileListobject + " ss " + this.firstarray + " ss " + this.secondarray);
    this.fileListobject = [];
    for (let i = 0; i < this.firstarray.length; i++) {
      this.fileListobject.push(this.firstarray[i]);
    }
    for (let i = 0; i < this.secondarray.length; i++) {
      this.fileListobject.push(this.secondarray[i]);
    }
  }

  //for the purpose of version Upload
  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  upload(i) {
    this.progress.percentage = 0;

    this.currentFileUpload = this.selectedFiles.item(0);
    this.uploadService.pushFileVersionToStorage(this.currentFileUpload,this.fileListobject[i].fileid).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress.percentage = Math.round(100 * event.loaded / event.total);
      } else if (event instanceof HttpResponse) {
        console.log('File is completely uploaded!');
      }
    });

    this.selectedFiles = undefined;
  }



//  toDataURL(url) {
//   console.log('RESULT:');
//   var xhr = new XMLHttpRequest();
//   xhr.onload = function() {
//     var reader = new FileReader();
//     reader.onloadend = function() {
//       console.log(reader.result);
//     }
//     reader.readAsDataURL(xhr.response);
//   };
//   xhr.open('GET', url);
//   xhr.responseType = 'blob';
//   xhr.send();
// }


selectFileUpload(event) {
  this.selectedFiles = event.target.files;
}

uploadFile() {
  this.progress.percentage = 0;

  this.currentFileUpload = this.selectedFiles.item(0);
  this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(event => {
    if (event.type === HttpEventType.UploadProgress) {
      this.progress.percentage = Math.round(100 * event.loaded / event.total);
      console.log(this.progress.percentage);
      if(this.progress.percentage=== 100){
        this.allOfTheFetchingLogic();
      }
    } else if (event instanceof HttpResponse) {
      console.log('File is completely uploaded!');
    }
  });
  this.selectedFiles = undefined;
  this.progress.percentage=0;
}


 
  

}
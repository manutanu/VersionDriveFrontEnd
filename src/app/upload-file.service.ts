import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
 
@Injectable({
  providedIn: 'root'
})
export class UploadFileService {
 
  constructor(private http: HttpClient) { }
 
  pushFileToStorage(file: File): Observable<HttpEvent<{}>> {
    const formdata: FormData = new FormData();
 
    formdata.append('file', file);
    
    // const header = new HttpHeaders().set("Authorization",`Bearer ${sessionStorage.getItem("token")}`);
    const req = new HttpRequest('POST', environment.urlstring+'/upload/'+sessionStorage.getItem("userid"), formdata, {
      reportProgress: true,
      responseType: 'text',
    });
 
    return this.http.request(req);
  }

  pushFileVersionToStorage(file: File,fileid): Observable<HttpEvent<{}>> {
    const formdata: FormData = new FormData();
 
    formdata.append('file', file);
    
    // const header = new HttpHeaders().set("Authorization",`Bearer ${sessionStorage.getItem("token")}`);
    const req = new HttpRequest('POST', environment.urlstring+'/uploadversion/'+sessionStorage.getItem("userid")+'/'+fileid, formdata, {
      reportProgress: true,
      responseType: 'text',
    });
 
    return this.http.request(req);
  }

pushFileVersionToStoragefromShare(file: File,fileid,userid): Observable<HttpEvent<{}>> {
  const formdata: FormData = new FormData();

  formdata.append('file', file);
  
  // const header = new HttpHeaders().set("Authorization",`Bearer ${sessionStorage.getItem("token")}`);
  const req = new HttpRequest('POST', environment.urlstring+'/uploadversion/'+userid+'/'+fileid, formdata, {
    reportProgress: true,
    responseType: 'text',
  });

  return this.http.request(req);
}

}
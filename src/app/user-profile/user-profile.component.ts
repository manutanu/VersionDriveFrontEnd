import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingScreenService } from 'app/loading-screen.service';
import { environment } from 'environments/environment';



export class UserObject{
  private username;
  private email;
}

export class Transaction{

  public actionTaken;
  public fileName;
  public fromemail;
  public toemail;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  transactionList:Transaction[]=[];

  constructor(private loadingScreenService:LoadingScreenService,private router:Router,private http:HttpClient) {
    if(sessionStorage.getItem('username')==='' || sessionStorage.getItem("token")==='')
    this.router.navigate(['/login']);
   }

   userProfileObject:UserObject;
  ngOnInit() {
    this.loadingScreenService.startLoading();
    // const header = new HttpHeaders().set("Authorization", `Bearer ${sessionStorage.getItem("token")}`);
    // , { headers: header }
    this.http.get<UserObject>(environment.urlstring+'/viewdownload/getUserProfile/' + sessionStorage.getItem("userid"))
      .subscribe(data => {
        console.log(data);
        this.userProfileObject=data;
        this.loadingScreenService.stopLoading();
      },
        error => {
          this.loadingScreenService.stopLoading();
        });
        // , { headers: header }
        this.http.get<Transaction[]>(environment.urlstring+'/viewdownload/activity/' + sessionStorage.getItem("userid"))
      .subscribe(data => {
        console.log(data);
        this.transactionList=data;
        console.log(this.transactionList[0].toemail);
        this.loadingScreenService.stopLoading();
      },
        error => {
          this.loadingScreenService.stopLoading();
        });
        // this.loadingScreenService.stopLoading(); 
  }



}

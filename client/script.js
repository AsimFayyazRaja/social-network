var app=angular.module('fb', [])
       .config(['$locationProvider', function($locationProvider) {
           $locationProvider.html5Mode(false);
           $locationProvider.hashPrefix('');
        }]);

    app.controller('home',function($scope,$http){       
    $scope.message="hi";
});

    app.controller('index',function($scope,$http){       
        $scope.submitLogin=function()
        {
          //alert('button pressed');
          console.log($scope.loginusername,$scope.loginpassword);
          var userdata={
                username: $scope.loginusername,
                password: $scope.loginpassword
            };
          $http.put('/users/login',{data: userdata})
          .then(function(res){
            alert('Logged in');
          },function(err){
            alert('Invalid credentials');
          });
        };

        $scope.submitSignup=function()
        {
            var userdata={
                username: $scope.username,
                password: $scope.password,
                fname: $scope.fname,
                lname: $scope.lname,
                dob: $scope.date
            };
          $http.post('/users/signup',{data: userdata}).then(function(res){
            alert('username password sent to server');
          },function(err){
            alert('signup unsuccessfull, use another username');  
          });
        };

});


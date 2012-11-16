// JavaScript Document
var router = Davis(function () {
  this.get('#', function (req) {
    return;
  }),
  this.post('#', function (req) {
    return;
  }),
  this.get('/vvr/detail/:number/signup/', function () {
    return;
  }),
  this.get('/vvr/detail/:number/login/', function () {
    return;
  }),
  this.get('/vvr/', function () {
    App.galleryImagesController.set('view','list');
    App.galleryImagesController.setView();
    App.galleryImagesController.research();
    return;
  }),
  this.get('/vvr/detail/:number/', function (req) {
    App.galleryImagesController.set('view','detail');
    App.galleryImagesController.setView(req.params['number']);
    return;
  }),
  this.get('/vvr/detail/:number/share/', function (req) {
    App.galleryImagesController.doShare();
    return;
  }),
  this.get('/vvr/detail/:number/reserve/', function (req) {
    App.galleryImagesController.doReserve();
    return;
  })
})

router.start();
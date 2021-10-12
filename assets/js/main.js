$(document).ready(function(){
    scroll();
    navSlide();
    showNavigation();
    $(".zatvori").click(zatvori);
    var strana = window.location.href;
    if(strana.indexOf("index.html")!==-1){
        prikazRobneMarke();
        showProducts()
    }else if(strana.indexOf("gume.html")!==-1){
        showProducts();
        prikazRobneMarke();
        $("#dropdownSort").click(function(){
            $("#prikaz").find("ul").slideToggle();
        })
        const tbDimenzija = document.getElementById('tbDimenzije');
        $("#sezona").on("change",filtrirajPoSezoni);
        $("#proizvodjac").on("change",filtrirajPoMarki);
        $("#sortiraj").on("change",sortiraj);
        const cenaRN = $("#rnCena");
        cenaRN.on('input', izmeniCenu);
        const btnCenaRN = $("#filtriraj");
        btnCenaRN.on("click",filterCenaRN);
    }else if(strana.indexOf("kontakt.html")!==-1){
        $("#btnKontakt").on("click",regexProvera);
    }else if(strana.indexOf("korpa.html")!==-1){
        let proizvodi = proizvodiUKorpi();
        if(proizvodi.length){
            prikaziProizvodeUKorpi()
            $("#kupi").show();
        }else{
            praznaKorpa();
        }
    }

    
})




function prikaziProizvodeUKorpi(){
    $.ajax({
        url : "assets/data/products.json",
        method: "GET",
        dataType: "json",
        success : function(data) {
            let products = proizvodiUKorpi();
            let proizvodi = [];
            proizvodi = data.filter(p => {
                for(let pr of products)
                {
                    if(p.id == pr.id) {
                        p.kolicina = pr.kolicina;
                        return true;
                    }      
                }
                return false;
            });
            getTable(proizvodi);
        }
    });
}

function getTable(data){
    let html = `<table class="table table-bordered mt-3">
    <thead>
      <tr>
        <th class="product-thumbnail">Fotografija</th>
        <th class="product-thumbnail">Naziv</th> 
        <th class="product-thumbnail">Cena</th>
        <th class="product-thumbnail">Količina</th>
        <th class="product-thumbnail">Ukupno</th>
        <th class="product-thumbnail">Ukloni</th>
      </tr>
    </thead>
    <tbody>`
    data.forEach(p => {
        html +=`<tr>
        <td class="product-thumbnail">
          <img src="${p.slika}" alt="${p.opis}" class="img-fluid imgKorpa">
        </td>
        <td class="product-name">
          <h2 class="h5 text-black">${p.naziv}</h2>
        </td>
        <td>${p.cena} din</td>
        <td>
          <div class="input-group mb-3" style="max-width: 120px;">
            <div class="input-group-prepend">
              <button class="btn btn-outline-danger js-btn-minus" id="minus" type="button">−</button>
            </div>
            <input type="text" class="form-control text-center" value="4" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
            <div class="input-group-append">
              <button class="btn btn-outline-primary js-btn-plus" id="plus" type="button">+</button>
            </div>
          </div>

        </td>
        <td>${parseInt(p.cena) * 4} din</td>
        <td><button class="btn btn-danger btn-sm" onclick='obrisiIzKorpe(${p.id})'>X</button></td>
      </tr>`
    })
     html +=` 
    </tbody>
  </table>`
    $("#tabelaKorpe").html(html);
}

function proizvodiUKorpi() {
    return JSON.parse(localStorage.getItem("proizvodi"));
}

function dodajUkorpu() {
    $(".dodajUkorpu").click(function(e){
        e.preventDefault();
        let id = $(this).data("id");

    let proizvodi = proizvodiUKorpi();
    
    function dodajPrviProizvodUKorpu() {
        let proizvod = [];
        proizvod[0] = {
            id : id,
            kolicina : 1
        };
        localStorage.setItem("proizvodi", JSON.stringify(proizvod));
        $(".alert").removeClass("hide");
    }
    proizvodi ? daLiJeDodatoUKorpu() ? proizvodSeNalaziUKorpi() : dodajProizvod() : dodajPrviProizvodUKorpu();

    function proizvodSeNalaziUKorpi(){
        alert("Proizvod se nalazi u korpi,izaberite drugi.")
        $(".alert").addClass("hide").slideUp();
    }

    function daLiJeDodatoUKorpu() {
        return proizvodi.filter(p => p.id == id).length;
    }
    function dodajProizvod() {
        let proizvod = proizvodiUKorpi();
        proizvod.push({
            id : id,
            kolicina : 1
        });
        localStorage.setItem("proizvodi", JSON.stringify(proizvod));
        $(".alert").removeClass("hide");
    }
    
    });
}

function obrisiIzKorpe(id){
    let proizovdi = proizvodiUKorpi();
    let filtrirajProizvode = proizovdi.filter( function(x){
        if(x.id != id)
            return true;
    })

    localStorage.setItem("proizvodi", JSON.stringify(filtrirajProizvode));
    prikaziProizvodeUKorpi();

}

function praznaKorpa(){
    let div = document.createElement("div");
    div.setAttribute("id","praznaKorpa")
    div.setAttribute("class","d-flex align-items-center justify-content-center ")
    let h = document.createElement("h1");
    div.append(h);
    let tekst = "Korpa je prazna";
    h.append(tekst);
    h.setAttribute("class","font-weight-light")
    $("#tabelaKorpe").html(div);
    $("#kupi").hide();
}

//Zatvori
function zatvori(){
    return $(this).parent().addClass("hide");
}


//Filtriranje po ceni
function filterCenaRN(){
    $.ajax({
        url:"assets/data/products.json",
        method:"GET",
        dataType:"json",
        success:function(data){
            var cena = $("#rnCena").val();
                let filterCena = data.filter(function (x) {
                    if (parseInt(x.cena) <= parseInt(cena) ) {
                        return x;
                      }
                });
                if(filterCena.length){
                    getProducts(filterCena);
                }else{
                    nemaProizvoda();
                }
                    
                localStorage.setItem("cena",JSON.stringify(filterCena));
        },
        error:function(xhr,error){
            console.log(error); 
        }
    })
}
function izmeniCenu() {
    var cena = $("#rnCena").val();
    $("#cenaIzbor").text(parseFloat(cena));
}
//Filtriranje po Marki
function filtrirajPoMarki(){
    const trenutnaMarka = this.value;
    $.ajax({
        url:"assets/data/products.json",
        method:"GET",
        dataType:"json",
        success:function(data){
            if(trenutnaMarka != "0"){
                let marka = data.filter(function(x){
                    if(x.robnaMarka.naziv == trenutnaMarka){
                        return x;
                    }
                });
                getProducts(marka);
                localStorage.setItem("marka",JSON.stringify(marka));
            }else{
                getProducts(data);
            }
        }
    })
}
//Filtriranje po sezoni
function filtrirajPoSezoni(){
    const trenutnaSezona = this.value;
    console.log(trenutnaSezona)
    $.ajax({
        url:"assets/data/products.json",
        method:"GET",
        dataType:"json",
        success:function(data){
            let leto;
            let zima;
                if(trenutnaSezona!='0'){
                    if(trenutnaSezona == "leto"){
                        leto = data.filter( function(x) {
                            if(trenutnaSezona !="0" && x.sezona.leto){
                                return x;
                            }
                        })
                        getProducts(leto);
                        localStorage.setItem("sezona",JSON.stringify(leto));
                    }
                    if(trenutnaSezona == "zima"){
                        zima = data.filter( function(y){
                            if(trenutnaSezona !="0" && y.sezona.zima){
                                return y;
                            }
                        })
                        getProducts(zima);
                        localStorage.setItem("sezona",JSON.stringify(zima));
                    }

                }else{
                    getProducts(data);
                }
            
            
        }
    })
}


//ROBNE MARKE
function prikazRobneMarke(){
    $.ajax({
        url:"assets/data/brands.json",
        method:"GET",
        dataType:"json",
        success:function(data){
            let markePocetna = "";
            let robnaMarka = `<option value="0">proizvođač</option>`;
            data.forEach(marka => {
                markePocetna += `<div class="col-lg-4 col-md-6 d-flex justify-content-around">
                <img src="${marka.slika}" alt="${marka.naziv}" class="brend"/>
                </div>`
                robnaMarka +=`<option value="${marka.naziv}">${marka.naziv}</option>`;
            })
                $("#marke").html(markePocetna);
                $("#proizvodjac").html(robnaMarka);
        }
    })
}
//sortiranje
function sortiraj(data){
    let soritrajPo = this.value;
    let sortirano;
    $.ajax({
        url:"assets/data/products.json",
        method:"GET",
        dataType:"json",
        success:function(data){
            if(soritrajPo != "0"){
                if(soritrajPo == "nazivAZ"){
                    sortirano = data.sort(function (a,b){
                        if(a.naziv > b.naziv)
                        return 1;
                    else if(a.naziv < b.naziv)
                        return -1;
                    else 
                        return 0;
                    })
                    getProducts(sortirano);
                }
                if(soritrajPo == "nazivZA"){
                    sortirano = data.sort(function(a,b){
                        if(a.naziv > b.naziv)
                            return -1;
                        else if(a.naziv < b.naziv)
                            return 1;
                        else 
                            return 0;
                    })
                    getProducts(sortirano);
                }
                if(soritrajPo == "cenaP"){
                    sortirano = data.sort(function(a,b){
                        if(parseInt(a.cena) >parseInt(b.cena))
                            return 1;
                        else if(parseInt(a.cena) < parseInt(b.cena))
                            return -1;
                        else 
                            return 0;
                    })
                    getProducts(sortirano);
                }
                if(soritrajPo == "cenaR"){
                    sortirano = data.sort(function(a,b){
                        if(parseInt(a.cena) > parseInt(b.cena))
                            return -1;
                        if(parseInt(a.cena) < parseInt(b.cena))
                            return 1;
                        else 
                            return 0;
                    })
                    getProducts(sortirano);
                }
    }else{
        getProducts(data);
    }
        }
    })
    
}

function nemaProizvoda(){
    let div = `<div id="nemaProizvoda"><h2>Nema na stanju traženih proizvoda</h2></div>`
    $("#proizvodi").html(div);
}

function showProducts(){
    $.ajax({
        url:"assets/data/products.json",
        method:"GET",
            dataType:"json",
            success:function(data){
                getProducts(data);
                najtrazenije(data);
                dodajUkorpu();
            }
    })
}

function najtrazenije(products){
    let html=``;
    products.forEach(product => {
        if(product.cena < 4000){
                html +=`<div class="col-lg-4 col-md-6 col-sm-6 rounded-lg m-auto">
                <div class="item-logo">
                    <img src="${product.robnaMarka.slika}" alt="${product.robnaMarka.naziv}"/>
                </div>
                <div class="product-item">
                    <img src="${product.slika}" alt="${product.opis}"/>
                </div>
                <div class="item-title text-center">
                    <h3 class="text-uppercase">${product.naziv}</h3>
                    <p>${product.opis}`
                    if(product.sezona.leto){
                    html +=`<span><i class="fas fa-sun text-warning"></i></span>`}else{
                        html +=`<span><i class="fas fa-snowflake text-white"></i></span>`;
                    }
                    html +=`</p>
                </div>
                <div class="item-desc text-center">
                    <h4>${product.dimenzije.sirina}/${product.dimenzije.visina} R${product.dimenzije.precnik}</h4>
                    <div class="d-flex justify-content-center">
                    <p class="text-success font-weight-bold h4">${product.cena} din</p></div>
                    <a href="#"><button class="mb-3 dodajUkorpu" data-id=${product.id}><i class="fas fa-shopping-cart pl-2"></i> Dodaj u korpu</button></a>
                </div>
        </div>`
                }
    });
    
    $("#najtrazeniji").html(html);
}
//prikaz navigacije
function showNavigation(){
    $.ajax({
        url:"assets/data/navigation.json",
        method:"GET",
        dataType:"json",
        success:function(data){
            navigation(data);
        }
    })
}

function navigation(nav){
    let meniLi="";
    for(let i of nav){
        if(i.aktivan == true){
        meniLi +=`<li><a class="aktivan" href="${i.putanja}">${i.ime}</a></li>`;
        }else{
            meniLi +=`<li><a href="${i.putanja}">${i.ime}</a></li>`;
        } 
    }
    document.getElementById("meni").innerHTML = meniLi;
    document.getElementById("srkivenMeni").innerHTML = meniLi;
}

function getProducts(products){
    let html=``;
    products.forEach(product => {
        html +=`<div class="col-lg-4 col-md-6 col-sm-6 rounded-lg m-auto pb-4">
        <div class="item-logo">
            <img src="${product.robnaMarka.slika}" alt="${product.robnaMarka.naziv}"/>
        </div>
        <div class="product-item">
            <img src="${product.slika}" alt="${product.opis}"/>
        </div>
        <div class="item-title text-center">
            <h3 class="text-uppercase">${product.naziv}</h3>
            <p>${product.opis}`
            if(product.sezona.leto){
            html +=`<span><i class="fas fa-sun text-warning"></i></span>`}else{
                html +=`<span><i class="fas fa-snowflake text-white"></i></span>`;
            }
            html +=`</p>
        </div>
        <div class="item-desc text-center">
            <h4>${product.dimenzije.sirina}/${product.dimenzije.visina} R${product.dimenzije.precnik}</h4>
            <div class="d-flex justify-content-center">
            <p class="text-success font-weight-bold h4 boja">${product.cena} din</p></div>
            <a href="#"><button class="mb-3 dodajUkorpu" data-id=${product.id}><i class="fas fa-shopping-cart pl-2"></i> Dodaj u korpu</button></a>
        </div>
</div>`
    });

    $("#proizvodi").html(html);
}
//prikaz Brednova
function showsBrands(){

    $("#marke").html();
}

function regexProvera(){
    let ime,prezime,email,naslov,poruka,regexImePrezime,regexEmail,regexNaslov,regexPoruka,greske;
    ime = $("#ime").val().trim();
    prezime = $("#prezime").val().trim();
    email = $("#email").val().trim();
    naslov = $("#naslov").val().trim();
    poruka = $("#poruka").val().trim();
    greske = [];
    //regexi
    regexImePrezime = /^([A-ZŽĐŠ][a-zčćžšđ]{2,15}\s*)+$/;
    regexEmail = /^[\w\d\.]+@([a-z\.])+\.[a-z]{2,5}$/;
    regexNaslov = /^[\w]{3,20}$/;
    regexPoruka = /^.{15,}$/;
    //provera
    if(!regexImePrezime.test(ime)){
        $("#imeInfo").removeClass("hide");
        greske.push(ime);
    }else{
        $("#imeInfo").addClass("hide");
    }
    if(!regexImePrezime.test(prezime)){
        $("#prezimeInfo").removeClass("hide");
        greske.push(prezime);
    }else{
        $("#prezimeInfo").addClass("hide");
    }
    if(!regexEmail.test(email)){
        $("#emailInfo").removeClass("hide");
        greske.push(email);
    }else{
        $("#emailInfo").addClass("hide");
    }
    if(!regexNaslov.test(naslov)){
        $("#naslovInfo").removeClass("hide");
        greske.push(naslov);
    }else{
        $("#naslovInfo").addClass("hide");
    }
    if(!regexPoruka.test(poruka)){
        $("#porukaInfo").removeClass("hide");
        greske.push(poruka);
    }else{
        $("#porukaInfo").addClass("hide");
    }

    if(!greske.length){
        alert("Poruka uspešno poslata!");
        location.reload();
    }
}

//Burger slide
function navSlide(){
    $("#sendvic").click(function(){
        $("#prikazi").find("ul").slideToggle();    
    })
}

function scroll(){
    $("#scrollToTop").click(function(){
    
        $("html").animate({
            scrollTop: 0
        }, 1000);
    });
    
    $("#scrollToTop").hide();
    
    $(window).scroll(function(){
        let top = $("html").offset().top;
        top = $(this)[0].scrollY;
        if(top > 500){
            $("#scrollToTop").show();
        } else {
            $("#scrollToTop").hide();
        }
    })
    }
    
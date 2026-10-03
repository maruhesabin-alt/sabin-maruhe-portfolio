# ESPERANTO VIVO — Premium / Sabin Maruhe

Retejo en Esperanto kun animacioj, verda stelo, administra panelo, kontakta formularo kaj loka sinkronigo.

## 1. Lanĉi per VS Code

Malfermu ĉi tiun dosierujon en VS Code kaj uzu Live Server, aŭ rulu ĝin per simpla statika servilo.

## 2. Administrilo

Alklaku **SINKRONIGI** aŭ la ilaron ⚙. La administra pasvorto en ĉi tiu demonstraĵo estas:

`KUNLABORADU#2020`

La panelo permesas ŝanĝi:
- ĉefajn titolojn kaj mesaĝojn;
- kolorojn;
- nivelon de animacioj;
- telefonnumeron;
- retpoŝton;
- kontaktaĵan butonon;
- eksporton/importon de la agordo;
- ricevajn mesaĝojn de la formularo.

## 3. Grava pri vera tutmonda sinkronigo

Ĉi tiu ZIP estas **statika kaj tuj funkcianta**. La administraj ŝanĝoj estas konservataj en `localStorage`, do ili ne estas aŭtomate videblaj sur ĉiuj aparatoj.

Por ke Sabin faru ŝanĝon unufoje kaj ĉiuj vizitantoj en la mondo ricevu ĝin, oni devas konekti la administrilon al reta datumbazo (ekzemple Supabase) aŭ al alia sekura backend. La ZIP estas preparita por tiu sekva paŝo.

Ne metu sekretajn backendajn ŝlosilojn en la front-end JavaScript.

## 4. GitHub → Vercel

1. Kreu novan GitHub-repozitorion.
2. Alŝutu ĉiujn dosierojn de ĉi tiu dosierujo.
3. En Vercel elektu la GitHub-repozitorion.
4. Por ĉi tiu statika versio ne necesas build command.
5. Deploy.

## 5. Kontakta formularo

En la nuna statika versio la formularo konservas mesaĝojn en la sama retumilo. Por vera ricevado de mesaĝoj en la administra panelo de ie ajn, konektu ĝin al Supabase, Formspree, Resend aŭ via propra backend.

## 6. Lingvoj

La publika retejo estas Esperanto-unua. La enhavkampoj en la administrilo povas esti anstataŭigitaj per tradukoj. Por vera regiona lingvoŝanĝo, aldonu apartan tradukobjekton por ĉiu lingvo kaj konservu la elekton per `localStorage` aŭ backend.

## Sekureca noto

La pasvorto en ĉi tiu demonstraĵo estas nur por la loka admin UI. Ĝi **ne estas vera sekura aŭtentikigo**. Por produktado, uzu Supabase Auth aŭ alian serverflankan aŭtentikigon kaj konservu neniun administran sekreton en la klienta kodo.

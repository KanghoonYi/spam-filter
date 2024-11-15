# Spam-Filter

## 소개
이 프로젝트는 주어진 text의 URL을 추출하여, Spam인지 확인하는 알고리즘을 만드는 프로젝트 입니다.  
단순히 주어진 URL을 text로서 검사하는것이 아닌, URL에 HTTP요청을 보내어, 유효성, redirect까지 감안하여 Spam을 확인합니다.

## 프로젝트 환경
* nodejs 20을 기반으로 `typescript`로 작성되어 있습니다.
* Package manager로 NPM을 사용합니다.

## 프로젝트 설정
* eslint와 prettier를 사용하여 convetion check를 자동화 하였습니다.
* `typescript`로 작성했기 때문에, `ts-node`를 활용해야 합니다.

## 실행 방법

1. Nodejs 환경을 세팅합니다.
```commandline
$ nvm use
```

2. 프로젝트에서 요구하는 패키지를 설치합니다.
```commandline
$ npm install
```

3. npm으로 script를 실행하여, 작동하는지 확인합니다. 
```commandline
$ npm run testSpamFilter
```

## 되어 있는것
* 요청에 대한 병렬 처리
* 이미 방문한 domain이면, 건너뛰기
* 
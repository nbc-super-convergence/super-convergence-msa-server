# 🎲 Holy Poly Moly 🎲
## 🔗 게임 링크
<a href="https://super-convergence.itch.io/holypolymoly">
  <img src="https://github.com/user-attachments/assets/7ff2c030-379c-4e31-8e1f-45f0e78da567" alt="itch" width="200">
</a>

## 🎤 프로젝트 소개
<img width="495" alt="스크린샷 2024-12-20 오전 11 54 51" src="https://github.com/user-attachments/assets/512a2dc1-3f43-4740-99d7-66a9a1567e70" />

프로젝트 제작 기간 : 2024.11.13(수) ~ 2024.12.23.(월)

🎮 **게임 소개**
- **Holy Poly Moly**는 2 ~ 4인의 플레이어가 온라인으로 즐기는 **👨‍👨‍👦‍👦멀티플레이 파티 게임**입니다!

- 보드게임 판 위에서 **🎲주사위**를 굴리고, **🗾땅**을 사고, 친구의 땅과 코인을 **빼앗으며** 미니게임에서 **우정 파괴 대전**을 펼쳐보세요.

💥 **미니게임 라인업** 💥

- 🎉 **내려가며 디스코파티**: 리듬에 몸을 맡겨라! 춤추며 클럽의 최심부로 향해라!
- 💣 **폭탄 배달왔어요**: 누가 폭탄을 터뜨릴 것인가? 긴박감 넘치는 폭탄 릴레이!
- 🕺 **댄스 스텝 챌린지**: 누가 진정한 댄스의 왕인가? 퍼펙트를 노려라!
- 🧊 **미끌미끌 얼음판**: 끝까지 버텨라! 빙판 위의 서바이벌 전쟁!

🎮 지금 친구들을 초대하고, **최고의 파티 게임**을 경험해보세요! ✨
#### 📃 게임 진행 설명
```
1️⃣ 게임은 보드 게임과 미니 게임 크게 두 가지로 나누어집니다.

보드 게임에서는 주사위를 굴려 1 ~ 6 중 랜덤하게 나온 숫자만큼 이동하게 됩니다.

갈림길을 만나면 어디로 갈지 선택할 수 있고 

아무것도 없는 땅을 밟을 경우 땅을 구매할 수 있습니다.

상대방의 땅을 밟을 경우 코인을 빼앗기고 더 큰 코인을 소모해 땅을 빼앗을 수 있습니다.

별표시가 있는 땅을 밟을 경우 랜덤한 미니 게임 중 하나를 시작하게 됩니다.
```

```
2️⃣ 미니 게임은 총 4 가지 있습니다.

1. 미끌미끌 얼음판
2. 지하에서 디스코파티
3. 댄스 스텝 챌린지
4. 폭탄 배달왔어요

미니 게임이 끝나면 결과에 따라 코인을 차등 지급 받습니다.
```

```
3️⃣ 모든 라운드가 종료되면 플레이어가 보유하고 있던 땅을 포함한

총 보유 코인으로 랭킹을 정하게 됩니다.
```

## 🎯 프로젝트 목표
**실시간 멀티 플레이**

- 안정적인 네트워크 연결 유지와 사용자 간의 상호작용이 즉각 반영되는 게임 환경
- **TCP 프로토콜**을 이용해 안정성과 신뢰성 유지

 **분산 서버**

- 높은 사용자 트래픽을 처리하기 위해 서버를 분산화하여 안정성과 확장성 확보.
- 게이트 서버, 보드 게임 서버 등 서버를 분리하고 각각의 역할에 따라 구조 설계.
- **Redis**를 사용해서 상태 데이터를 중앙에서 일관되게 관리하고 서버 간 데이터 동기화.

 **스트레스 테스트**

- **Apache JMeter**를 활용해 병목 현상이 생기는 서버와 유저수 구간을 파악하고 개선.
- 연결 수, 데이터 처리량, 응답 시간 등의 성능 지표 측정.
- 최적화 작업 후 얼마나 개선되었는지 파악.

 **CI/CD**

- 자동화된 배포 프로세스를 통해 **개발 효율성**과 **개발 편의성**를 위해 **Docker, Docker-Compose**와 **Github Action**을 활용

 **클라이언트와 협업 경험**

- **클라이언트와 협업**을 통해 클라이언트와 서버 간 통합 테스트를 경험하고 실시간 데이터 동기화와 네트워크 프로토콜 설계를 위한 요구사항 협의 등을 진행하면서 의사소통 능력을 함양하고 협업 경험을 해보는 것.

## 🗺️서비스 아키텍처

![image](https://github.com/user-attachments/assets/24d99974-b5c2-4298-a828-1f906cecfd46)

## 🌊 플로우

#### 워크플로우
![워크프로우](https://github.com/user-attachments/assets/4c66843d-f623-4cb6-8c94-960ee2297f27)

#### 게임플로우
![게임플로우](https://github.com/user-attachments/assets/cc8b1949-59e8-4b9a-ba0f-befb0c772b76)


## 💻 주요 콘텐츠

- [회원가입/로그인](https://www.notion.so/teamsparta/1622dc3ef5148177831bc97048c4b882?pvs=4)
- [로비](https://www.notion.so/teamsparta/1622dc3ef51481869060fbc41c79b071?pvs=4)
- [대기방](https://www.notion.so/teamsparta/1622dc3ef51481c5903cdfc872e0e42a?pvs=4)
- [보드게임](https://www.notion.so/teamsparta/1622dc3ef51481f1b6fdd486ed7c7509?pvs=4)
- [미니게임](https://www.notion.so/teamsparta/1622dc3ef51481acad1dedef56c86f91?pvs=4)

## 📹 시연 영상
- [Holy Poly Moly 시연 영상](https://www.youtube.com/watch?v=q831XY0uWjg)

## 🧩 프로젝트 로직
- [게이트 및 Distributor](https://www.notion.so/teamsparta/Distributor-1622dc3ef514813ea758f2888875f57e?pvs=25)
- [서비스 서버](https://www.notion.so/teamsparta/1622dc3ef51481fdb8d4fd1215587084?pvs=25)

## 📚 기술 기록

- [서비스 아키텍처 - MSA(Micro Service Architecture)](https://www.notion.so/teamsparta/Service-Architecture-MSA-Micro-Service-Architecture-1622dc3ef5148101b9dcf786047465e5?pvs=25)
- [모노레포 - Turborepo](https://www.notion.so/teamsparta/Monorepo-Turborepo-1622dc3ef514819d9c38ffb3cfef3faa?pvs=25)
- [스트레스 테스트 - Apache JMeter](https://www.notion.so/teamsparta/Stress-Test-Jmeter-1622dc3ef51481af88c8ed808556b0e8?pvs=25)
- [로그 모니터링 - ELK stack(Elasticsearch + Logstash + Kibana) + Filebeat](https://www.notion.so/teamsparta/Log-Monitoring-ELK-stack-Elasticsearch-Logstash-Kibana-Filebeat-1622dc3ef514811e843cc64ff4bd5405?pvs=25)
- [서버 모니터링 - Grafana & Prometheus](https://www.notion.so/teamsparta/Server-Monitoring-Grafana-Prometheus-1622dc3ef5148125a916c929c1fab2dd?pvs=25)
- [CI/CD - Docker & Docker Compose + Github Actions](https://www.notion.so/teamsparta/CI-CD-Docker-Docker-Compose-Github-Actions-1622dc3ef514814dad02ff787242d6cc?pvs=25)

## 🚨 트러블 슈팅

- [빌드된 파일로 서비스 실행 시 protobuf를 찾지 못하는 문제](https://www.notion.so/teamsparta/protobuf-1622dc3ef514819ab269c518020997a6?pvs=25)
- [ESBuild로 빌드된 파일 실행시 CJS 사용 문제](https://www.notion.so/teamsparta/esbuild-CJS-1622dc3ef5148153ba19c98d45974865?pvs=25)
- [회원 가입 시 동시성 문제](https://www.notion.so/teamsparta/1622dc3ef51481339ffdfeeb8c1b5e9a?pvs=25)
- [Redis Cluster 단일 노드 사용 불가능 문제](https://www.notion.so/teamsparta/Redis-1622dc3ef51481d6b031d3e16a99fe81?pvs=25)
- [로그 수집 문제](https://www.notion.so/teamsparta/1622dc3ef5148197a269dc5968fd668b?pvs=25)

## 🧱 기술 스택

![기술 스택](https://github.com/user-attachments/assets/d739431c-ff94-492a-8942-7db26eb6f850)

## 🧠 기술적 의사 결정

- [Server](https://www.notion.so/teamsparta/Server-1622dc3ef514811db224e8a8e0dae8e6?pvs=4)
- [Database](https://www.notion.so/teamsparta/Database-1622dc3ef514810d9670eb33e7293734?pvs=4)
- [CI/CD](https://www.notion.so/teamsparta/CI-CD-1622dc3ef51481068053eb917711b82c?pvs=4)
- [Monitoring](https://www.notion.so/teamsparta/Monitoring-1622dc3ef51481e3a429f0b957790eb9?pvs=4)

## 💾 기획 / 게임 데이터 저장 및 관리

- [패킷 명세서](https://www.notion.so/teamsparta/1622dc3ef5148182b495dc46e574d327?pvs=4)
- [Database 저장 데이터](https://www.notion.so/teamsparta/Database-1622dc3ef51481dbace6d3da6046422e?pvs=4)

## 🔗 관련 링크

- [팀 노션](https://teamsparta.notion.site/b7495c3ce1f041368af4c5b286481c82)
- [팀 브로셔](https://www.notion.so/teamsparta/HOLY-POLY-MOLY-91e6d37a87e046dda24622ff514f0ec4#0f653df848e84acd9f96ee90d8659c90)
- [클라이언트](https://github.com/nbc-super-convergence/Unity_super-convergence)

## 👨‍👩‍👧‍👦 팀원

**서버 팀원**

| **역할** | **이름** | github | **기술 블로그** |
| --- | --- | --- | --- |
| 리더 | 전봉준 | https://github.com/devbong92 | https://velog.io/@vamuzz |
| 부리더 | 조웅상 | https://github.com/P-lani | https://p-lani.tistory.com/ |
| 팀원 | 김민재 | https://github.com/KonnoYuuki2 | https://velog.io/@ghi00345/posts |
| 팀원 | 박지영 | https://github.com/shd1495 | https://velog.io/@zkzkdh451/posts |

**클라이언트 팀원**

| **역할** | **이름** | github | **기술 블로그** |
| --- | --- | --- | --- |
| 리더 | 정승연 | https://github.com/Charen523 | https://better-constructor123.tistory.com/ |
| 팀원 | 손효재 | https://github.com/NFUE2 | https://son95214.tistory.com/ |
| 팀원 | 박인수 | https://github.com/ParkInsu456 | https://ottoman1444.tistory.com/ |
| 팀원 | 탁혁재 | https://github.com/RCO8 | https://hjstory9821.tistory.com/ |
| 팀원 | 이강혁 | https://github.com/Euronia12 |  |

const createLogStash = (host, port) => {
  const logstashTransport = new LogstashTransport({
    host: host, // Logstash의 IP 주소
    port: port, // Logstash에서 수신할 포트
    protocol: 'tcp', // 전송 프로토콜
    level: 'info', // 로그 레벨
    // 필요한 경우 추가 옵션 설정
  });
  return logstashTransport;
};

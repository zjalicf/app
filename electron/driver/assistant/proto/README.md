How to protobuf

```
npm install -g protoc-gen-ts

cd electron/driver/assistant

protoc -I=proto --ts_out=grpc --ts_opt=target=node ./proto/assistant.proto
```

In case contact adam@acreom.com

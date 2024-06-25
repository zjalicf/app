How to protobuf

```
npm install -g protoc-gen-ts

cd electron/driver/ai

protoc -I=proto --ts_out=grpc --ts_opt=target=node ./proto/ai.proto
```

In case contact adam@acreom.com

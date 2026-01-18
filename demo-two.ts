enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Error = "ERROR"
}

const currentStatus: Status = Status.Success;

console.log(`Current Status: ${currentStatus}`);
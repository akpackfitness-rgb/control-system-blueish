import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Outcall "http-outcalls/outcall";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = { name : Text };
  type PackId = Nat64;
  type Status = { #active; #inactive };
  type Pack = { id : PackId; name : Text; description : Text; status : Status; createdAt : Time.Time };
  type AccessEvent = { packId : PackId; userId : Principal; action : Text; timestamp : Time.Time };
  type AccessAssignment = { packId : PackId; userId : Principal; grantedAt : Time.Time };
  var nextPackId : PackId = 1;
  let packs = Map.empty<PackId, Pack>();
  let accessAssignments = List.empty<AccessAssignment>();
  let accessLog = List.empty<AccessEvent>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Member = {
    membershipId : Text;
    clientName : Text;
    clientNo : Text;
    packageName : Text;
    packageValidity : Text;
    status : Text;
  };

  public type AttendanceRecord = {
    membershipId : Text;
    clientName : Text;
    date : Text;
    checkInTime : Text;
    checkOutTime : Text;
    packageDetails : Text;
    packageValidity : Text;
    status : Text;
  };

  let appsScriptUrl : Text = "https://script.google.com/macros/s/AKfycbyhG0kDajgsg10-xAczrGYXg0hpskTpk5nZh7_Wli4uk11LwILo5sVbYOVNJVGEV9GgrQ/exec";

  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // ── Raw HTTP helpers (return JSON text for frontend parsing) ────────────

  public func getRawMembers() : async Text {
    await Outcall.httpGetRequest(
      appsScriptUrl # "?action=getMembers",
      [],
      transform,
    );
  };

  public func getRawAttendance() : async Text {
    await Outcall.httpGetRequest(
      appsScriptUrl # "?action=getAttendance",
      [],
      transform,
    );
  };

  public func checkIn(membershipId : Text) : async Text {
    let body = "action=checkIn&membershipId=" # membershipId;
    await Outcall.httpPostRequest(
      appsScriptUrl,
      [{ name = "Content-Type"; value = "application/x-www-form-urlencoded" }],
      body,
      transform,
    );
  };

  public func checkOut(membershipId : Text) : async Text {
    let body = "action=checkOut&membershipId=" # membershipId;
    await Outcall.httpPostRequest(
      appsScriptUrl,
      [{ name = "Content-Type"; value = "application/x-www-form-urlencoded" }],
      body,
      transform,
    );
  };

  // ── User Profile Functions ──────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ── Pack Management Functions ───────────────────────────────────────────

  public shared ({ caller }) func createPack(name : Text, description : Text) : async PackId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create packs");
    };
    let id = nextPackId;
    nextPackId += 1;
    let pack : Pack = {
      id;
      name;
      description;
      status = #active;
      createdAt = Time.now();
    };
    packs.add(id, pack);
    id;
  };

  public query ({ caller }) func getPack(id : PackId) : async ?Pack {
    ignore caller;
    packs.get(id);
  };

  public query ({ caller }) func listPacks() : async [Pack] {
    ignore caller;
    packs.values().toArray();
  };

  public shared ({ caller }) func updatePackStatus(id : PackId, status : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update pack status");
    };
    switch (packs.get(id)) {
      case (?pack) {
        let updated : Pack = { id = pack.id; name = pack.name; description = pack.description; status; createdAt = pack.createdAt };
        packs.add(id, updated);
      };
      case null Runtime.trap("Pack not found");
    };
  };
};

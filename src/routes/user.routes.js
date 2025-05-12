// superAdminRoutes.js
import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { verifySuperAdmin } from "../../middlewares/superAdminMiddleware.js";
import { setTenantContext } from "../../middlewares/tenantContextMiddleware.js";
import { 
    registerSuperAdmin,
    loginSuperAdmin,
    // logoutSuperAdmin,
    createTenant,
    // getAllTenants,
    // getTenantById,
    // updateTenantStatus,
    // deleteTenant,
    // createAdminForTenant,
    // getTenantStatistics,
    // getDashboardStats
} from "../controllers/superAdmin.controller.js";
import {  addpannelcontroller, allPannelcontroller,onePannelcontroller, editPannelController, updatePannelOrder,tenantAllPanel } from "../controllers/addpannel.controller.js";
import { addPackagecontroller,allPackagecontroller,onePackagecontroller,editPackageController,tenantAllPackage } from "../controllers/Package.controller.js";
import {  getOneTest,addingTest,editTest,allTest,testCate,editTestCate,editdefaultresult,
    getAllTestCate,getOneTestCate,updateTestCate,
    findTestcontroller,updateTestcontroller, updateTestOrder,updateTestInterpretation,
    addUnit,getUnits,tenantTest,addsample,fetchsample } from "../controllers/addtest.controller.js";
import {  addCategory,fetchCategories,updatecategoryOrder,categoryById } from "../controllers/categoryController.js";
import  { registerUser, loginUser, logOutUser,
refreshAccessToken, superFranchiseeCreate, moneySendToFranchisee
, moneySendToSubFranchisee, moneySendToSuperFranchisee, amountUpdate, getMyFranchisees, fetchAllFranchisee, moneyDebitFromSuperFranchisee,
moneyDebitFromFranchisee, moneyDebitFromSubFranchisee, getFilteredTransactionHistory,verifyPin } from "../controllers/user.controller.js";

const router = Router();

// Auth routes
router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
// router.post("/logout", verifySuperAdmin, logoutSuperAdmin);

// Tenant management
router.post("/tenants", verifySuperAdmin, createTenant);
// router.get("/tenants", verifySuperAdmin, getAllTenants);
// router.get("/tenants/:tenantId", verifySuperAdmin, setTenantContext, getTenantById);
// router.patch("/tenants/:tenantId/status", verifySuperAdmin, setTenantContext, updateTenantStatus);
// router.delete("/tenants/:tenantId", verifySuperAdmin, setTenantContext, deleteTenant);

// // Tenant admin creation
// router.post("/tenants/:tenantId/admin", verifySuperAdmin, setTenantContext, createAdminForTenant);

// // Statistics
// router.get("/tenants/:tenantId/stats", verifySuperAdmin, setTenantContext, getTenantStatistics);
// router.get("/dashboard", verifySuperAdmin, getDashboardStats);


































// import routes from other database files



// router.route("/register").post(
//     upload.fields([
//         {
//             name: "avtar",
//             maxCount: 1
//         }, {
//             name: "coverImage",
//             maxCount: 1
//         }
//     ]), registerUser)

router.route("/login-admin").post(loginUser)

// router.route("/franchisee-login").post(franchiseeLogIn, 

router.route('/franchisee-create').post(verifyJWT,superFranchiseeCreate)

router.route('/get-super-franchisee').get(verifyJWT,getMyFranchisees)
// // single franchisee data
// router.route('/franchisee-data').get(franchisee)
// // secured routes
router.route("/logout").post(verifyJWT,logOutUser)

// router.route("/refresh-token").post(refreshAccessToken)

// //superFranchisee fetch and update
// router.route("/superFranchisee-fetch").get( superFranchiseeUpdate)

// // superFranchisee update 
// router.route("/superFranchisee-update").post( sfUpdate)

// // superFranchisee log out
// router.route("/superFranchiseeLogout").post(  superFranchiseeLogout)

// //fetchFranchisee
// router.route("/fetchFranchisee").get(adminOnly, fetchAllFranchisee)

// // franchisee logout
// router.route("/franchisee-logOut").post(
//      franchiseeLogOut)
// // subFranchisee created
// router.route("/subFranchise-create").post( franchiseOnly, subFranchiseeCreate)

// //superfranchisee update
// router.route("/superFranchisee-update").put(sfUpdate)

// // update password
// router.route("/change-password").put(updatePassword)
// //subFranchisee log in
// router.route("/subFranchisee-logIn").post( subFranchiseeLogIn, 
// //subFranchisee log out

// router.route("/subFranchisee-logOut").post(
//      subFranchiseeLogOut)

// // wallet system routes
// // admin can send
// router.route("/admin-send-to-super").post(adminOnly,moneySendToSuperFranchisee)
// router.route("/admin-send-to-franchisee").post(adminOnly,moneySendToFranchisee)
// router.route("/admin-send-to-sub-franchisee").post(adminOnly,moneySendToSubFranchisee)

// // admin can credit
// router.route("/admin-debit-from-super").post(adminOnly,moneyDebitFromSuperFranchisee)
// router.route("/admin-debit-from-franchisee").post(adminOnly,moneyDebitFromFranchisee)
// router.route("/admin-debit-from-sub-franchisee").post(adminOnly,moneyDebitFromSubFranchisee)

// // super franchisee can send
// router.route("/super-send-to-franchisee").post(sendMoneyToFranchisee)

// // one to one conection 
// router.route("/super-send-to-franchisee").post(superFranchiseonly,sendMoneyToFranchisee)
// router.route("/franchisee-send-to-sub-franchisee").post(franchiseOnly,moneySendToSubFranchisee)
// //franchisee send money to subFranchisee

// // get assigned pannels
// router.route("/get-all-pannels").post( getAssignedPanels)

// // get test
// router.route("/get-test").post(getAssignedTests)

// //get assigned package
// router.route("/get-all-packages").post(getAssignedPackages )

// //assing test price
// router.route("/assign-prices").put(assignTestPrice)

// router.route('/franchisee-send-to-sub').post(sendMoneyToSubFranchisee)
// // fetch wallet amount
//  router.route('/wallet-amount/:userId').get(amountUpdate)
// // fetch transaction History
// router.route('/transaction-history').get(getFilteredTransactionHistory)
// // All get request here for fetch  data from database

// // admin amount assign to super franchisee
// router.route('/assignPrice').post(assignPrice)

// // add staff and list staff
// router.route('/add-staff').post(createStaff)
// router.route('/list-staff').get( stafflist)

router.route('/add-unit').post(addUnit)
router.route('/get-units').get(getUnits)
router.route('/category-add').post(testCate)
router.route('/category-list').get( getAllTestCate)
router.route('/category-found').get(getOneTestCate)
router.route('/category-edit').post(updateTestCate)

// router.route('/bookings').get(loadBooking)
// router.route('/all-bookings').get(loadAllBooking)
// // commission ledger
// router.route('/commission-ledger').get(listCommission)
router.route("/test").post(allTest)
router.route("/make-test").post(verifySuperAdmin,addingTest)
router.route("/make-test-tenant").post(verifyJWT,addingTest)
router.route("/test-found").get(getOneTest)
router.route("/test-edit").post(editTest)
// router.route("/ledger").post(getLedger)
// router.route("/ledger-summary").get(getLedgerSummary)
// router.route("/total-commission").get(totalCommission)
// router.route("/account-summary").get(accountSummary )
// router.route("/ledgerEntries").get(getLedgerEntries)
// router.route("/bookings-search").get(searchit)
// router.route("/assign-single-test-price").post(assignSingleTestPrice)
// router.route("/verify-pin").post(verifyPin)
// router.route("/get-booking-all").get(getAllBookingsController)
// router.route("/get-franchisee-all").get(AllFranchisee)
// router.route('/analytics').get(getBusinessAnalytics)
//kaif routes






















// all pannels route
router.route('/all-packages').post(allPackagecontroller);
router.route('/all-packages-tenant').post(verifyJWT,tenantAllPackage);
// add package route
router.route('/add-package').post(verifySuperAdmin,addPackagecontroller);
router.route('/add-package-tenant').post(verifyJWT,addPackagecontroller);

// fething editone pannel
router.route('/one-Pannel/:value1').post(onePannelcontroller);

// fething editone package
router.route('/one-Package/:value1').post(onePackagecontroller);

// edit pannels route
router.route('/edit-Pannel/:value1').post(editPannelController);

// edit pannels route
router.route('/edit-Package/:value1').post(editPackageController);

// // add Test Package
router.route('/add-panels').post(verifySuperAdmin,addpannelcontroller)
router.route('/add-panels-tenant').post(verifyJWT,addpannelcontroller)
router.route('/all-pannels').post(allPannelcontroller)
router.route('/all-pannels-tenant').post(verifyJWT,tenantAllPanel)

// booking related routes

// find test controller
router.route('/findTest/:name/:shortName').post(findTestcontroller);

// update test 
router.route('/editTest/:name/:shortName').post(updateTestcontroller);

// // for fetching all test data
router.route("/categoryById").post(verifySuperAdmin,categoryById)

router.route("/categoryById-tenant").post(verifyJWT,categoryById)

// for fetching all test data
router.route("/editTestOrder").post(updateTestOrder)

// // new booking controller
// router.route("/new-booking").post(upload.fields([
//     {
//         name: "file",
//         maxCount: 1
//     }
// ]),
// NewBookingcontroller);

// // fetching all-bookings from database
// router.route("/last-booking").post(allBookingsController)

// //addDoctorsController
// router.route("/add-doctor").post(addDoctorsController)

// //all doctors fetching
// router.route("/all-doctor").get(allDoctorsController)

// //addLabController
// router.route("/add-Lab").post(addLabController)

// //addLabController
// router.route("/all-Lab").get(allLabController)

// // get all bookings controller
// router.route("/get-bookings").post(getAllBookingsController)

// // update booking status
// router.route("/update-booking-status").post(updatebookingstatus)

// // reject booking status
// router.route("/reject-booking").post(rejectBookingcontroller)

// // get booking by barcodeId
// router.route("/get-barcode").post(getbarcodebooking)


// // get booking by barcodeId
// router.route("/testsByBarcode").post(getbarcodetestsandpannels)

// // fetching all tests
// router.route("/allTestdetails").post(allTestdetails)

// // fetching selected test defaultresult
// router.route("/edit-add-defaultresults").post(defaultResultsGet);

// //editing selected tests defaultresult
// router.route("/edit-defaultresults").post(editdefaultresult);

// // recieving report-data
// router.route("/saveReportData").post(SaveReportController);

// // edit report-data
// router.route("/editReportData").post(editReportController);

// // // recieving report
// router.route("/ReportData").post(getReportController);

// // recieving pdf
// // router.route("/generate-pdf").post(pdfgeneratorcontroller);

// // // report by bookingId
// // router.route("/report/:bookingId").post(getReportByBookingId);

// // report by bookingId
// router.route("/isreportready").post(bookingreportgenOrnot);


// for fetching all test data
router.route("/test-database").post(allTest)

// for fetching all test data
router.route("/test-database").get(allTest)

router.route("/test-database-tenant").post(verifyJWT,tenantTest)
// // report by bookingId
// router.route("/thirty-days-bookings").post(getthirtydayspreviousBookingsController);

// // recieving pdf
// router.route("/generate-pdf2").post(pdfgeneratorcontroller2);

// // uploading template
// router.route("/template").post(upload.fields([
//     {
//         name: "template",
//         maxCount: 1
//     }
// ]),uploadImage);

// // getting template
// router.route("/templates").post(getAllTemplates);

// // getting template
// router.route("/get-pdf").post(getpdfcontroller)

// // getting template
// router.route("/delete-image").post(deleteImage)

// // getting template
// router.route("/adding-pdf-data").post(savingPdfDatacontroller)

// // getting template
// router.route("/generate-barcode").post(barcodegeneratecontroller)

// // getting template
// router.route("/getting-pdf-data").post(getCustomizationByReportId)

// // getting template
// router.route("/generate-qr").post(qrcodecontroller);

// // getting template
// router.route("/reject-barcode").post(deleteBarcode);

// // getting template
// router.route("/getbarcodeTests").post(getTestNameController);

// // adding category
router.route("/addCategory").post(addCategory);

// // adding category
router.route("/updatecategoryOrder").post(updatecategoryOrder);

// adding category
router.route("/updatePannelOrder").post(updatePannelOrder);

// // fetching all Categories
router.route("/fetchCategories").post(fetchCategories);





// // send sms
// router.route("/send-sms").post(upload.fields([
//     {
//         name: "pdf",
//         maxCount: 1
//     }
// ]),sendSMS)

// // send whatsapp
// router.route("/send-whatsapp").post(upload.fields([
//     {
//         name: "pdf",
//         maxCount: 1
//     }
// ]),sendWhatsApp)

// // send email
// router.route("/send-email").post(upload.fields([
//     {
//         name: "pdf",
//         maxCount: 1
//     }
// ]),sendEmail)


// // fetching all Categories
// router.route("/getbooking").post(getBookingcontroller);

// // edit booking
// router.route("/editBooking").post(upload.fields([
//     {
//         name: "file",
//         maxCount: 1
//     }
// ]), editBookingController);

// router.route("/editReportsignofffield").post(editReportsignofffieldController);

// router.route("/uploadLabInchargeSign").post(upload.fields([
//     {
//         name: "sign",
//         maxCount: 1
//     }
// ]), uploadLabInchargeSign);

// router.route("/getLabInchargeSign").post(getLabInchargeSign);

// router.route("/deleteLabInchargeSign").post(deleteLabInchargeSign);

// router.route("/saveTestTemplate").post(saveTestTemplate);

// router.route("/getTemplatesByTestId").post(getTemplatesByTestId);

// router.route("/deleteTemplateByName").post(deleteTemplateByName);

router.route("/updateTestInterpretation").post(updateTestInterpretation);

// router.route("/CompleteBookingcontroller").post(CompleteBookingcontroller);

// router.route("/saveConversation").post(saveConversation);

// router.route("/getConversationByBookingId").post(getConversationByBookingId);

// router.route("/statusBookingcontroller").post(statusBookingcontroller);
// //for saving current entered results
// router.route("/saveOrUpdateBookedTest").post(saveOrUpdateBookedTest);

// //for fetching entered results
// router.route("/getBookedTestById").post(getBookedTestById);

router.route("/addsample").post(addsample);
router.route("/fetchsample").get(fetchsample);

export default router;
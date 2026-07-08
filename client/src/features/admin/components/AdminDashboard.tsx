import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Space,
  Select,
  ConfigProvider,
  theme,
  Tag,
  Tabs,
  Upload,
  Badge,
  App,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RcFile } from "antd/es/upload";
import {
  Edit,
  Trash2,
  CirclePlus,
  FlaskConical,
  UploadCloud,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import {
  getAllExercisesApi,
  createExerciseApi,
  updateExerciseApi,
  deleteExerciseApi,
  getTestCasesByChallengeApi,
  getAllCategoriesApi,
} from "../api";

interface CategoryData {
  _id: string;
  name: string;
}

interface ChallengeData {
  _id?: string;
  title: string;
  description: string;
  module?: number;
  topic: string;
  patternGroup?: string;
  difficulty: "easy" | "medium" | "hard";
  challengeType: "coding" | "multiple_choice";
  testcases: TestCase[];
}

interface TestCase {
  id: string;
  type: "sample" | "edge_case" | "random" | "stress_test";
  input: string;
  expected_output: string;
}

interface JsonTestCaseStructure {
  type?: "sample" | "edge_case" | "random" | "stress_test";
  input?: string;
  expected_output?: string;
}

interface JsonFileStructure {
  problem_name?: string;
  type?: string;
  module?: number;
  test_cases?: JsonTestCaseStructure[];
}

const DashboardContent: React.FC = () => {
  const { message } = App.useApp();

  const [data, setData] = useState<ChallengeData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<ChallengeData | null>(null);
  const [form] = Form.useForm();

  const [isTestCaseModalOpen, setIsTestCaseModalOpen] =
    useState<boolean>(false);
  const [currentChallenge, setCurrentChallenge] =
    useState<ChallengeData | null>(null);
  const [isSubFormOpen, setIsSubFormOpen] = useState<boolean>(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [subForm] = Form.useForm();

  const initData = async () => {
    setLoading(true);
    try {
      const [exerciseRes, categoryRes] = await Promise.all([
        getAllExercisesApi(),
        getAllCategoriesApi(),
      ]);

      if (Array.isArray(categoryRes.data)) {
        setCategories(categoryRes.data);
      }

      const rawList = Array.isArray(exerciseRes.data)
        ? exerciseRes.data
        : exerciseRes.data && Array.isArray(exerciseRes.data.data)
          ? exerciseRes.data.data
          : [];

      const mappedData = rawList.map((item: any) => ({
        ...item,
        topic: item.categoryId || item.topic || "",
        patternGroup: item.patternGroup || "",
        testcases: item.testcases || item.test_cases || [],
      }));

      setData(mappedData);
    } catch (err: any) {
      message.error("Không thể tải dữ liệu hệ thống!");
      console.error("Lỗi Init API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSubmit = (): void => {
    form.validateFields().then(async (formValues) => {
      const payload: any = {
        problem_name: formValues.title,
        description: formValues.description,
        difficulty: formValues.difficulty,
        challengeType: "coding",
        categoryId: formValues.topic,
        patternGroup: formValues.patternGroup || "",
      };

      try {
        if (editing && editing._id) {
          await updateExerciseApi(editing._id, payload);
          message.success("Cập nhật thử thách thành công!");
        } else {
          const tempSlug = formValues.title
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, "-")
            .replace(/[^\w\-]+/g, "");

          await createExerciseApi({
            ...payload,
            slug: tempSlug,
            test_cases: [],
          });
          message.success("Thêm thử thách thành công!");
        }

        initData();
        setOpen(false);
        setEditing(null);
        form.resetFields();
      } catch (err: any) {
        message.error("Thao tác thất bại!");
        console.error("Lỗi Response từ Backend:", err.response?.data);
      }
    });
  };

  const handleEdit = (record: ChallengeData): void => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue({
      ...record,
      topic: record.topic,
      difficulty: record.difficulty || "easy",
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteExerciseApi(id);
      message.success("Đã xóa thử thách thành công!");
      initData();
    } catch (err) {
      message.error("Xoá thử thách thất bại!");
    }
  };

  const handleOpenTestCases = async (record: ChallengeData): Promise<void> => {
    setIsTestCaseModalOpen(true);
    setLoading(true);

    try {
      if (record._id) {
        const response = await getTestCasesByChallengeApi(record._id);
        const dbTestCases = Array.isArray(response.data) ? response.data : [];

        const formattedTestCases = dbTestCases.map((tc: any) => ({
          id: tc._id,
          type: tc.type || "sample",
          input: tc.input || "",
          expected_output: tc.expectedOutput || tc.expected_output || "",
          explanation: tc.explanation || "",
        }));

        const updatedChallenge = { ...record, testcases: formattedTestCases };
        setCurrentChallenge(updatedChallenge);

        setData((prevData) =>
          prevData.map((item) =>
            item._id === record._id
              ? { ...item, testcases: formattedTestCases }
              : item,
          ),
        );
      }
    } catch (error) {
      message.error("Không thể tải danh sách testcase từ DB!");
      console.error("Lỗi tải testcases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubForm = (testcase?: TestCase): void => {
    if (testcase) {
      setEditingTestCase(testcase);
      subForm.setFieldsValue(testcase);
    } else {
      setEditingTestCase(null);
      subForm.resetFields();
    }
    setIsSubFormOpen(true);
  };

  const saveTestCasesToBackend = async (
    challenge: ChallengeData,
    testcases: TestCase[],
  ): Promise<boolean> => {
    if (!challenge._id) return false;
    setLoading(true);

    const formattedTestCases = testcases.map((tc: any, index: number) => {
      const numericId =
        parseInt(String(tc.id).replace(/[^\d]/g, ""), 10) || index + 1;
      return {
        id: numericId,
        type: tc.type || "sample",
        input: tc.input || "",
        expected_output: tc.expected_output || "",
        explanation: tc.explanation || "",
      };
    });

    const payload = {
      problem_name: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      challengeType: challenge.challengeType || "coding",
      categoryId: challenge.topic,
      patternGroup: challenge.patternGroup || "",
      test_cases: formattedTestCases,
    };

    try {
      await updateExerciseApi(challenge._id, payload);

      const response = await getTestCasesByChallengeApi(challenge._id);
      const dbTestCases = Array.isArray(response.data) ? response.data : [];

      const reloadedFormatted = dbTestCases.map((tc: any) => ({
        id: tc._id,
        type: tc.type || "sample",
        input: tc.input || "",
        expected_output: tc.expectedOutput || tc.expected_output || "",
        explanation: tc.explanation || "",
      }));

      setCurrentChallenge({ ...challenge, testcases: reloadedFormatted });
      setData((prevData) =>
        prevData.map((item) =>
          item._id === challenge._id
            ? { ...item, testcases: reloadedFormatted }
            : item,
        ),
      );
      return true;
    } catch (error) {
      console.error("Failed to save test cases:", error);
      message.error("Không thể lưu testcase lên server!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubFormSubmit = (): void => {
    subForm.validateFields().then(async (formValues) => {
      if (!currentChallenge) return;
      let updatedTestCases = [...(currentChallenge.testcases || [])];
      if (editingTestCase) {
        updatedTestCases = updatedTestCases.map((tc) =>
          tc.id === editingTestCase.id ? { ...tc, ...formValues } : tc,
        );
      } else {
        const newTestCase: TestCase = {
          id: "tc_" + Date.now(),
          ...formValues,
        };
        updatedTestCases.push(newTestCase);
      }

      const success = await saveTestCasesToBackend(
        currentChallenge,
        updatedTestCases,
      );
      if (success) {
        message.success(
          editingTestCase
            ? "Cập nhật testcase thành công!"
            : "Thêm testcase thành công!",
        );
      }
      setIsSubFormOpen(false);
      subForm.resetFields();
    });
  };

  const handleDeleteTestCase = async (testCaseId: string): Promise<void> => {
    if (!currentChallenge) return;
    const updatedTestCases = (currentChallenge.testcases || []).filter(
      (tc) => tc.id !== testCaseId,
    );

    const success = await saveTestCasesToBackend(
      currentChallenge,
      updatedTestCases,
    );
    if (success) {
      message.success("Đã xóa testcase!");
    }
  };

  const handleImportJsonFiles = (fileList: RcFile[]): void => {
    if (!currentChallenge) return;
    let newImportedTestCases: TestCase[] = [];
    let completedFiles = 0;

    fileList.forEach((file: RcFile) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const resultString = e.target?.result as string;
          const json = JSON.parse(resultString) as JsonFileStructure;

          if (json && Array.isArray(json.test_cases)) {
            const parsedCases: TestCase[] = json.test_cases.map(
              (tc: JsonTestCaseStructure) => ({
                id: `tc_json_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                type: tc.type || "random",
                input: tc.input || "",
                expected_output: tc.expected_output || "",
              }),
            );
            newImportedTestCases = [...newImportedTestCases, ...parsedCases];
            message.success(`Đọc thành công dữ liệu từ file: ${file.name}`);
          } else {
            message.error(
              `File ${file.name} sai cấu trúc (thiếu mảng test_cases).`,
            );
          }
        } catch (error) {
          message.error(
            `File ${file.name} lỗi định dạng hoặc không phải JSON chuẩn.`,
          );
        } finally {
          completedFiles++;
          if (completedFiles === fileList.length) {
            if (newImportedTestCases.length === 0) {
              message.warning(
                "Quá trình import hoàn tất: Không có testcase nào hợp lệ.",
              );
            } else {
              const updatedTestCases = [
                ...(currentChallenge.testcases || []),
                ...newImportedTestCases,
              ];
              void saveTestCasesToBackend(currentChallenge, updatedTestCases).then(
                (success) => {
                  if (success) {
                    message.success(
                      `🎉 Đã nạp thành công ${newImportedTestCases.length} testcase.`,
                    );
                  }
                },
              );
            }
          }
        }
      };
      reader.onerror = () => {
        message.error(`Không thể đọc file ${file.name}.`);
        completedFiles++;
      };
      reader.readAsText(file);
    });
  };

  const columns: ColumnsType<ChallengeData> = [
    { title: "Title", dataIndex: "title", key: "title", width: "25%" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: "40%",
    },
    {
      title: "Topic (Chủ đề)",
      dataIndex: "topic",
      key: "topic",
      width: "15%",
      render: (categoryId: string) => {
        const foundCategory = categories.find((cat) => cat._id === categoryId);
        return (
          <span className="font-semibold text-slate-300">
            {foundCategory ? foundCategory.name : "Chưa phân loại"}
          </span>
        );
      },
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      width: "10%",
      render: (text: string) => {
        const lowerText = text?.toLowerCase();
        let color = "green";
        let label = "Dễ";
        if (lowerText === "medium") {
          color = "orange";
          label = "Thường";
        }
        if (lowerText === "hard") {
          color = "red";
          label = "Khó";
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Space size="middle">
          <Badge
            count={record.testcases?.length || 0}
            showZero={false}
            overflowCount={99}
            offset={[4, 12]}
            style={{
              color: "#ffffff",
              fontSize: "9px",
              height: "12px",
              minWidth: "12px",
              lineHeight: "12px",
              padding: 0,
            }}
          >
            <FlaskConical
              size={16}
              className="text-orange-500 hover:text-orange-400 cursor-pointer transition-colors"
              onClick={() => handleOpenTestCases(record)}
            />
          </Badge>
          <Edit
            size={16}
            className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors"
            onClick={() => handleEdit(record)}
          />
          <Trash2
            size={16}
            className="text-red-500 hover:text-red-400 cursor-pointer transition-colors"
            onClick={() => handleDelete(record._id!)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-[calc(100vh-64px)] bg-[#050816]">
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 mx-1 rounded-xl bg-linear-to-r from-[#2563eb] to-[#3b82f6] border-none text-white outline-none focus:outline-none"
      >
        <CirclePlus size={18} />
        Thêm câu hỏi mới
      </Button>

      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
        className="bg-[#111827] rounded-lg overflow-hidden shadow-2xl border border-zinc-800/50 mt-4"
      />

      <Modal
        open={open}
        title={editing ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        width={850}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Tiêu đề không được để trống" }]}
          >
            <Input />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item
              name="topic"
              label="Chủ đề (Topic)"
              rules={[
                { required: true, message: "Vui lòng chọn danh mục chủ đề" },
              ]}
              className="flex-1"
            >
              <Select placeholder="Chọn chủ đề từ danh sách">
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="patternGroup"
              label="Thuật toán (Pattern)"
              className="flex-1"
            >
              <Input placeholder="Ví dụ: Two Pointers, Sliding Window..." />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label="Độ khó"
              rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}
              className="flex-1"
            >
              <Select placeholder="Chọn độ khó">
                <Select.Option value="easy">Dễ</Select.Option>
                <Select.Option value="medium">Thường</Select.Option>
                <Select.Option value="hard">Khó</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            name="description"
            label="Nội dung chi tiết"
            rules={[
              { required: true, message: "Nội dung không được để trống" },
            ]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isTestCaseModalOpen}
        title={`Danh sách Testcase: ${currentChallenge?.title || ""}`}
        onCancel={() => {
          setIsTestCaseModalOpen(false);
          setCurrentChallenge(null);
        }}
        footer={null}
        width={900}
        centered
      >
        <Tabs
          defaultActiveKey="1"
          className="mt-2"
          items={[
            {
              key: "1",
              label: "Dữ liệu cấu hình thủ công",
              children: (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <Button
                      onClick={() => handleOpenSubForm()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white border-none"
                    >
                      <CirclePlus size={16} /> Thêm Testcase
                    </Button>
                  </div>
                  <Table
                    dataSource={currentChallenge?.testcases || []}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                      {
                        title: "Loại",
                        dataIndex: "type",
                        key: "type",
                        width: "15%",
                        render: (type: string) => {
                          const colors: Record<string, string> = {
                            sample: "blue",
                            edge_case: "purple",
                            random: "cyan",
                            stress_test: "volcano",
                          };
                          return (
                            <Tag color={colors[type] || "default"}>
                              {type.toUpperCase()}
                            </Tag>
                          );
                        },
                      },
                      {
                        title: "Đầu vào (Input)",
                        dataIndex: "input",
                        key: "input",
                        ellipsis: true,
                        render: (text: string) => (
                          <code className="bg-zinc-800 px-2 py-1 rounded text-xs">
                            {text}
                          </code>
                        ),
                      },
                      {
                        title: "Kết quả (Expected Output)",
                        dataIndex: "expected_output",
                        key: "expected_output",
                        ellipsis: true,
                        render: (text: string) => (
                          <code className="bg-zinc-800 px-2 py-1 rounded text-xs">
                            {text}
                          </code>
                        ),
                      },
                      {
                        title: "Hành động",
                        key: "action",
                        align: "center",
                        width: "15%",
                        render: (_, record: TestCase) => (
                          <Space size="middle">
                            <Edit
                              size={14}
                              className="text-blue-500 hover:text-blue-400 cursor-pointer"
                              onClick={() => handleOpenSubForm(record)}
                            />
                            <Trash2
                              size={14}
                              className="text-red-500 hover:text-red-400 cursor-pointer"
                              onClick={() => handleDeleteTestCase(record.id)}
                            />
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "2",
              label: "Nhập dữ liệu từ file JSON",
              children: (
                <div className="mt-4 py-4">
                  <Upload.Dragger
                    multiple={true}
                    accept=".json"
                    showUploadList={false}
                    beforeUpload={(
                      file: RcFile,
                      fileList: RcFile[],
                    ): boolean => {
                      if (file === fileList[0]) handleImportJsonFiles(fileList);
                      return false;
                    }}
                    className="border-dashed border-2 border-zinc-700 bg-zinc-900/30 rounded-2xl hover:border-blue-500 transition-colors py-8"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-zinc-800/80 rounded-full text-blue-500">
                        <UploadCloud size={32} />
                      </div>
                      <p className="ant-upload-text text-slate-200 font-medium">
                        Nhấp hoặc kéo thả file JSON vào đây để tải lên
                      </p>
                    </div>
                  </Upload.Dragger>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        open={isSubFormOpen}
        title={editingTestCase ? "Cập nhật Testcase" : "Tạo Testcase mới"}
        onCancel={() => setIsSubFormOpen(false)}
        onOk={handleSubFormSubmit}
        okText="Lưu Testcase"
        cancelText="Hủy"
        width={600}
        centered
      >
        <Form form={subForm} layout="vertical" className="mt-4">
          <Form.Item
            name="type"
            label="Phân loại Testcase"
            rules={[{ required: true, message: "Vui lòng chọn loại testcase" }]}
          >
            <Select placeholder="Chọn loại dữ liệu mẫu">
              <Select.Option value="sample">Sample</Select.Option>
              <Select.Option value="edge_case">Edge case</Select.Option>
              <Select.Option value="random">Random</Select.Option>
              <Select.Option value="stress_test">Stress test</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="input"
            label="Dữ liệu đầu vào"
            rules={[
              { required: true, message: "Dữ liệu input không được trống" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: 5\n1 5 3 9 2"
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item
            name="expected_output"
            label="Expected output"
            rules={[
              { required: true, message: "Dữ liệu output không được trống" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: 1 9"
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          colorBgContainer: "#111827",
          colorBgElevated: "#1f2937",
        },
      }}
    >
      <App>
        <DashboardContent />
      </App>
    </ConfigProvider>
  );
};
